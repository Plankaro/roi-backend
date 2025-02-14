import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,

} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { PUBLIC_KEY } from '../decorator/public.decorator'; // Adjust the path
import { Reflector } from '@nestjs/core';
import { DatabaseService } from 'src/database/database.service';
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly databaseService: DatabaseService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true; // Skip auth if public
    }
  
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Authentication failed');
    }
  
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.ACCESS_TOKEN_JWT_SECRET,
      });
  
      if (!payload || !payload.sub) {
        throw new UnauthorizedException('Authentication failed');
      }
  
      const user = await this.databaseService.user.findUnique({
        where: {
          id: payload.sub,
          
        },
        include:{
          business:true
        }
      });
  
      if (!user) {
        throw new UnauthorizedException('Authentication failed');
      }
  
      request['user'] = user; // ✅ Attach the user to the request
  
    } catch (err) {
      throw new UnauthorizedException('Authentication failed');
    }
  
    return true; // ✅ Ensure request['user'] is always set before returning true
  }

  private extractTokenFromHeader(request: Request): string | null {
    const authHeader = request.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split(' ')[1];
    if (!token || token.split('.').length !== 3) {
      return null; // Invalid token format
    }

    return token;
  }
}
