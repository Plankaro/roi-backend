import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { RegisterAuthDto } from './dto/register-auth-dto';

import { DatabaseService } from 'src/database/database.service';
import { Prisma } from '@prisma/client';
import { hash, compare } from 'bcrypt';
import { LoginDto } from './dto/login-auth.dto';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
  constructor(
    private readonly databaseService: DatabaseService
    ,private readonly jwtService: JwtService
  ) {}
  

  async login(LoginDto: LoginDto) {
    try {
      const user = await this.databaseService.user.findUnique({
        where: {
          email: LoginDto.email,
        },
      });
      if (!user) throw new ForbiddenException('Invalid email or password');
      if (!user.password)
        throw new BadRequestException('User is registered with auth provider');
      const isMatch = await compare(LoginDto.password, user.password);
      if (!isMatch) throw new ForbiddenException('Invalid email or password');
      const userTokens = await this.getTokens(user.id, user.email);
     await this.databaseService.user.update({
        where: { id: user.id },
        data:{
          refreshToken: userTokens.refresh_token
        }
      });
      return userTokens
      
    } catch (e) {
      throw new InternalServerErrorException(
        e.message || 'An unexpected error occurred during login.'
      );
    }
  }

  async register(registerAuthDto: RegisterAuthDto) {
    try {
      // Hash the password before saving it to the database
      const hashedPassword = await hash(registerAuthDto.password, 10);

      // Create the user in the database
      const user = await this.databaseService.user.create({
        data: {
          ...registerAuthDto,
          password: hashedPassword, // Save the hashed password
        } as Prisma.UserCreateInput,
      });

      // Return the user details excluding the password
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      };
    } catch (error) {
      // Handle unique constraint violations (e.g., email or phone already in use)
      if (error.code === 'P2002') {
        throw new BadRequestException(
          'A user with this email or phone number already exists.',
        );
      }

      // Log and rethrow unexpected errors
      console.error('Error during user registration:', error);
      throw new InternalServerErrorException(
        error.message || 'An unexpected error occurred during login.'
      );
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update() {
    return `This action updates a #} auth`;
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
        expiresIn: '15m',
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
