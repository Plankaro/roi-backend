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
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true; // Skip the guard if the route is marked as public
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
      console.log(payload);
      request['user'] = payload.sub; // Attach the user to the request
    } catch (err) {
      throw new UnauthorizedException('Authentication failed');
    }

    return true; // Grant access if the token is valid
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
