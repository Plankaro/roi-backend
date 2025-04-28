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

import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { SendgridService } from 'src/sendgrid/sendgrid.service';
import { randomBytes } from 'crypto';
import { Response } from 'express';
import { createHmac } from 'crypto';
import axios from 'axios';
import { decrypt, encrypt } from 'utils/usefulfunction';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { UpdateProfileDto } from './dto/update-user.dto';



@Injectable()
export class AuthService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService,
    @InjectRedis() private readonly redis: Redis,
    private readonly sendgridService: SendgridService,
    @InjectQueue('webhookSubscribe') private readonly webhookSubscribe: Queue,
    @InjectQueue('webhookUnsubscribe') private readonly webhookUnsubscribe:Queue,
  ) {}

  async login(LoginDto: LoginDto) {
    try {
      
      const user = await this.databaseService.user.findUnique({
        where: {
          email: LoginDto.email,
        },

        include: {
          business: {
            select: {
              id: true,
              businessName: true,
            },
          },
        },
      });


      if (!user) throw new UnauthorizedException('no user  found');
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
          image: user.image,
        },
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        error.message || 'An unexpected error occurred during login.',
      );
    }
  }

  async getUser(req: any) {
    try {
      const user = req.user;
      const userDetails = {
        name:user.name,
        email:user.email,
        image:user.image , 
        role:user.role,
       

      }
      return userDetails;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async updateUser(UpdateProfileDto:UpdateProfileDto,req:any){
    const user = req.user
    try {
      const userEdit = await this.databaseService.user.findUnique({
        where: {
          id: user.id,
        },
      });

      if (!userEdit) {
        throw new NotFoundException('User not found');
      }
     

      const data = {}
      if(UpdateProfileDto.name) data['name'] = UpdateProfileDto.name
      if(UpdateProfileDto.image) data['image'] = UpdateProfileDto.image

      if(UpdateProfileDto.newPassword){
        const isMatch = await compare(UpdateProfileDto.currentPassword, userEdit.password);

        if (!isMatch){
          throw new UnauthorizedException('Invalid current password');
        }

        const hashedPassword = await hash(UpdateProfileDto.newPassword, 10);
        data['password'] = hashedPassword
      }

      await this.databaseService.user.update({
        where: {
          id: user.id,
        },
        data,
      });
    


  }catch(error){
    throw new InternalServerErrorException(error);
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
      console.log(error);
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
 

      const token = refresh_token.replace(/^Bearer\s/, '').trim();

      const secret = process.env.REFRESH_TOKEN_JWT_SECRET;
      if (!secret) {
        console.error('[RefreshToken] Missing REFRESH_TOKEN_JWT_SECRET');
        throw new InternalServerErrorException(
          'Missing REFRESH_TOKEN_JWT_SECRET',
        );
      }

      const verifyToken = await this.jwtService.verifyAsync(token, {
        secret,
      });
    

      if (!verifyToken) {
        console.error('[RefreshToken] Token verification failed');
        throw new UnauthorizedException('Invalid login');
      }

      const user = await this.databaseService.user.findUnique({
        where: {
          id: verifyToken.sub,
    
        
        },
      });

    

      if (!user) {
        console.error(
          '[RefreshToken] User not found or refresh token mismatch',
        );
        throw new BadRequestException('Invalid login');
      }

      const userTokens = await this.getTokens(user.id, user.email);
      

      await this.databaseService.user.update({
        where: { id: user.id },
        data: {
          refreshToken: userTokens.refresh_token,
        },
      });
      ('[RefreshToken] Updated user with new refresh token');

      return userTokens;
    } catch (error) {
      console.error('[RefreshToken] Error occurred:', error);
      throw new BadRequestException('Invalid login');
    }
  }

  async remove(id: number) {
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

  async installShopify(shop: string,req:any) {
    try {
      const user = req.user
      
      // if(user.role !== 'ADMIN') {
      //   throw new UnauthorizedException('You are not allowed to install shopify');
      // }
      const state = randomBytes(16).toString('hex');
      if(!shop) {
        throw new BadRequestException('Shopify domain is required');
      }
 
      const installUrl = encodeURI(
        `https://${shop}/admin/oauth/authorize` +
          `?client_id=${process.env.SHOPIFY_CLIENT_ID}` +
          `&scope=${process.env.SHOPIFY_SCOPES}` +
          `&redirect_uri=${process.env.BACKEND_URL}/auth/shopify/callback` +
          `&state=${state}`,
      );

      const shopifyData = {
        buisness_id: user.business.id,
        shop: shop,
      };
      await this.redis.set(state, JSON.stringify(shopifyData), 'EX', 60 * 5);


      return {
        installUrl: installUrl}
    } catch (error) {

    }
  }

  async verfifyShopifyCallback(query: Record<string, string>, res: Response) {

    // 1. Verify HMAC
    const secret = process.env.SHOPIFY_CLIENT_SECRET;
    if (!secret) {
      console.error('[Callback] Missing SHOPIFY_API_SECRET');
      throw new InternalServerErrorException('Missing SHOPIFY_API_SECRET');
    }

    const { hmac, ...restParams } = query;

    // Construct message with only Shopify-specified params: code, shop, state, timestamp
    const message = Object.keys(restParams)
      .sort()
      .map((key) => `${key}=${restParams[key]}`)
      .join('&');
    

    const generatedHmac = createHmac('sha256', secret)
      .update(message)
      .digest('hex');
    

    if (generatedHmac !== hmac) {
      console.error('[Callback] HMAC validation failed');
      throw new BadRequestException('HMAC validation failed');
    }


    // 2. Exchange code for access token
    const apiKey = process.env.SHOPIFY_CLIENT_ID;
    if (!apiKey) {
      console.error('[Callback] Missing SHOPIFY_API_KEY');
      throw new InternalServerErrorException('Missing SHOPIFY_API_KEY');
    }

   
    let tokenResponse;
    const payload = {
      client_id: apiKey,
      client_secret: secret,
      code: query.code,
    };


    try {
      tokenResponse = await axios.post(
        `https://${query.shop}/admin/oauth/access_token`,
        payload,
      );
      
    } catch (err) {
      console.error(
        '[Callback] Token exchange error:',
        err.response?.data || err.message,
      );
      // Return raw Shopify error to client for debugging
      return res
        .status(err.response?.status || 500)
        .send(err.response?.data || 'Error exchanging code');
    }

    const accessToken = tokenResponse.data.access_token;
   

    // 3. Persist the token where appropriate (DB, Redis, etc.)
    // Example: await this.redisService.getClient().set(`shopify:token:${restParams.shop}`, accessToken);
   

    // 4. Redirect to app UI
   const data = await this.redis.get(query.state);
   
const parsedData = JSON.parse(data);
    if (!data) return res.redirect(`${process.env.CLIENT_URL}/settings`);
    const { buisness_id, shop } = parsedData;

    const hashedToken = await encrypt(accessToken);

    

    const buisness = await this.databaseService.business.update({
      where: {
        id: buisness_id,
      },
      data: {
        shopify_Token: hashedToken,
        shopify_domain: shop,
        is_shopify_connected: true,
        shopify_url:shop,
      },
    });

    



    await this.redis.del(query.state);

    await this.webhookSubscribe.add(
      "shopify_app_install",
      {buisness_id: buisness_id},
      {
        delay: 0,
        removeOnComplete: true,
        removeOnFail: false,
        attempts:2,
      }
    );





    return res.redirect(`${process.env.CLIENT_URL}/settings`);
  }

  async uninstallShopify(res:any) {
    const user = res.user;
    const buisness = await this.databaseService.business.findUnique({
      where: {
        id: user.business.id,
        employees:{
          some:{
            id: user.id,
            role: 'ADMIN',
          }
        }
      },

    });


    if (!buisness) {
      throw new BadRequestException(
        'Only admin have acess to uninstall shopify',
      );

    }
    const updateShopify = await this.databaseService.business.update({
      where:{
        id:buisness.id
      },
      data:{
        is_shopify_connected:false,
        shopify_Token:null,
        shopify_domain:null,
      }
    })

    await this.webhookUnsubscribe.add(
      "shopify_app_install",
      {shopify_domain: buisness.shopify_domain,shopify_Token:buisness.shopify_Token},
      {
        delay: 0,
        removeOnComplete: true,
        removeOnFail: false,
        attempts:2,
      }
    );


  }

}
