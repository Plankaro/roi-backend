import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { RegisterAuthDto } from './dto/register-auth-dto';

import { DatabaseService } from 'src/database/database.service';
import { Prisma } from '@prisma/client';
import { hash, compare } from 'bcrypt';
import { LoginDto } from './dto/login-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { ResetPasswordDto } from './dto/forget-password.dto';
import { generateOtp } from 'utils/otp';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { SendgridService } from 'src/sendgrid/sendgrid.service';
import { error } from 'console';
@Injectable()
export class AuthService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService,
    @InjectRedis() private readonly redis: Redis,
    private readonly sendgridService: SendgridService,
  ) {}

  async login(LoginDto: LoginDto) {
    try {
      console.log(LoginDto);
      const user = await this.databaseService.user.findUnique({
        where: {
          email: LoginDto.email,
        },
        include: {
          business: true,
        },
      });
      console.log(user);

      if (!user) throw new UnauthorizedException('Invalid email or password');
      if (!user.password)
        throw new BadRequestException('User is registered with auth provider');
      const isUserVErified = user.isEmailVerified;
      if (!isUserVErified) throw new ForbiddenException('User is not verified');
      const isMatch = await compare(LoginDto.password, user.password);

      if (!isMatch)
        throw new UnauthorizedException('Invalid email or password');
      const userTokens = await this.getTokens(user.id, user.email);
      await this.databaseService.user.update({
        where: { id: user.id },
        data: {
          refreshToken: userTokens.refresh_token,
        },
      });

      return {
        userTokens,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          buisness: user.business,
        },
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        error.message || 'An unexpected error occurred during login.',
      );
    }
  }

  async register(registerAuthDto: RegisterAuthDto) {
    try {
      if (registerAuthDto.password !== registerAuthDto.confirmPassword)
        throw new BadRequestException(
          'Password and confirm password does not match',
        );
  
      const name = `${registerAuthDto.firstName} ${registerAuthDto.lastName}`;
      const hashedPassword = await hash(registerAuthDto.password, 10);
      console.log(registerAuthDto);
  
      // Create the business in the database
      const buisness = await this.databaseService.business.create({
        data: {
          businessName: registerAuthDto.buisnessname,
        },
      });
  
      // Create the user in the database and connect the business using its unique id
      const user = await this.databaseService.user.create({
        data: {
          email: registerAuthDto.email,
          role: 'ADMIN',
          password: hashedPassword,
          name: name,
          business: { connect: { id: buisness.id } },
        } as Prisma.UserCreateInput,
      });
  
      // Return the user details excluding the password
      return {
        id: user.id,
        name: user.name,
        email: user.email,
      };
    } catch (error) {
      console.log(error);
      // Handle unique constraint violations (e.g., email or phone already in use)
      if (error.code === 'P2002') {
        throw new BadRequestException(
          'A user with this email or phone number already exists.',
        );
      }
  
      // Log and rethrow unexpected errors
      console.error('Error during user registration:', error);
      throw new InternalServerErrorException(
        error.message || 'An unexpected error occurred during registration.',
      );
    }
  }
  

  async getTokenLink(email: string) {
    try {
      const user = await this.databaseService.user.findUnique({
        where: {
          email: email,
        },
      });

      if (!user) {
        throw new BadRequestException('Email not registered');
      }
      const jwtPayload: { sub: string; email: string } = {
        sub: user.id,
        email: user.email,
      };
      await this.redis.del(user.id);

      // Determine token expiration and link based on email verification status
      const tokenExpiration = user.emailVerified ? '15m' : '1d'; // 15 minutes for forget password, 1 day for email verification
      const token = await this.jwtService.signAsync(jwtPayload, {
        secret: process.env.ACCESS_TOKEN_JWT_SECRET,
        expiresIn: tokenExpiration,
      });

      const link = user.emailVerified
        ? `${process.env.CLIENT_URL}/reset-password/${token}` // Password reset link for verified users
        : `${process.env.CLIENT_URL}/verify/${token}`; // Verification link for unverified users

      // Set Redis key expiration based on use case
      const redisExpiration = user.emailVerified ? 60 * 15 : 60 * 60 * 24; // 15 minutes or 1 day in seconds
      await this.redis.set(
        user.id,
        JSON.stringify(token),
        'EX',
        redisExpiration,
      );

      // Send email
      await this.sendgridService.sendMail(
        user.email,
        'Your verification link',
        `Your link is: ${link}`,
      );

      return { message: 'Email sent successfully' };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async verifyToken(token: string) {
    try {
      const getToken = await this.jwtService.verifyAsync(token, {
        secret: process.env.ACCESS_TOKEN_JWT_SECRET,
      });

      if (!getToken) throw new BadRequestException('Invalid token');
      const isUsed = await this.redis.get(getToken.sub);
      if (!isUsed || isUsed === token)
        throw new BadRequestException('This token has already been used');
      const update = await this.databaseService.user.update({
        where: {
          id: getToken.sub,
        },
        data: {
          isEmailVerified: true,
          emailVerified: new Date(),
        },
      });
      if (!update) throw new BadRequestException('Invalid user');
      await this.redis.del(getToken.sub);
      return { message: 'Email verified successfully' };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'An unexpected error occurred during email verification.',
      );
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto, token: string) {
    try {
      const getToken = await this.jwtService.verifyAsync(token, {
        secret: process.env.ACCESS_TOKEN_JWT_SECRET,
      });
      if (!getToken) throw new BadRequestException('Invalid token');
      const isUsed = await this.redis.get(getToken.sub);
      if (!isUsed || isUsed === token)
        throw new BadRequestException('This token has already been used');

      const update = await this.databaseService.user.update({
        where: {
          id: getToken.sub,
        },
        data: {
          password: await hash(resetPasswordDto.password, 10),
        },
      });
      if (!update) throw new BadRequestException('Invalid user');
      await this.redis.del(getToken.sub);

      return { message: 'Password reset successfully' };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'An unexpected error occurred during password reset.',
      );
    }
  }

  async logout(userId: string) {
    try {
      await this.databaseService.user.update({
        where: { id: userId },
        data: {
          refreshToken: null,
        },
      });
      return { message: 'Logout successful' };
    } catch (error) {
      throw new InternalServerErrorException(
        error.message || 'An unexpected error occurred during logout.',
      );
    }
  }

  async RefreshToken(refresh_token: string) {
    try {
      const token = refresh_token.replace(/^Bearer\s/, '');

      const verifyToken = await this.jwtService.verifyAsync(token, {
        secret: process.env.REFRESH_TOKEN_JWT_SECRET,
      });

      if (!verifyToken) {
        throw new UnauthorizedException('Invalid login');
      }
      const user = await this.databaseService.user.findUnique({
        where: {
          id: verifyToken.sub,
        },
      });

      // if (!user || user.refreshToken !== refresh_token) {
      //   throw new BadRequestException('Invalid login');
      // }

      const userTokens = await this.getTokens(user.id, user.email);
      await this.databaseService.user.update({
        where: { id: user.id },
        data: {
          refreshToken: userTokens.refresh_token,
        },
      });
      return userTokens;
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Invalid login');
    }
  }
  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  async getTokens(userId: string, email: string) {
    const jwtPayload: { sub: string; email: string } = {
      sub: userId,
      email: email,
    };

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: process.env.ACCESS_TOKEN_JWT_SECRET,
        expiresIn: '1m',
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: process.env.REFRESH_TOKEN_JWT_SECRET,
        expiresIn: '7d',
      }),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }
}
