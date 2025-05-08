/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { DatabaseService } from 'src/database/database.service';

import { PUBLIC_KEY } from '../decorator/public.decorator';

import { jwtVerify } from 'jose';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly databaseService: DatabaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Skip public routes
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    console.log('[AuthGuard] Request URL:', request.url);
    console.log('[AuthGuard] Headers:', request.headers);
    console.log('[AuthGuard] Cookies:', request.cookies);

    // Ensure secret is set
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret) {
      console.error('[AuthGuard] NEXTAUTH_SECRET not set');
      throw new UnauthorizedException('Server misconfiguration');
    }

    // Determine cookie name based on environment
    const cookieName =
      process.env.NODE_ENV === 'production'
        ? '__Secure-authjs.session-token'
        : 'authjs.session-token';

    // Extract raw token from cookie
    
    const rawToken = request.cookies["authjs.session-token"] as string;
    if (!rawToken) {
      console.error('[AuthGuard] No session cookie found');
      throw new UnauthorizedException('Unauthorized: Missing session token');
    }
    console.log('[AuthGuard] Raw token from cookie:', rawToken);

    // Decode the JWE session token
    let tokenPayload: any;
    const { jwtVerify } = await import('jose');
    try {
      const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
      const { payload } = await jwtVerify(rawToken, secret);
      tokenPayload = payload;
      console.log('[AuthGuard] Decoded token payload:', tokenPayload);
    } catch (err) {
      console.error('[AuthGuard] Error decoding token:', err);
      throw new UnauthorizedException('Unauthorized: Invalid session token');
    }

    if (!tokenPayload || (!tokenPayload.sub && !tokenPayload.id)) {
      console.error('[AuthGuard] Invalid token payload');
      throw new UnauthorizedException('Unauthorized: Invalid token payload');
    }

    // Determine user ID
    const userId = tokenPayload.sub ?? tokenPayload.id;
    console.log('[AuthGuard] Resolved userId:', userId);

    // Fetch user record
    const user = await this.databaseService.user.findUnique({
      where: { id: userId as string },
      include: { business: true },
    });
    if (!user) {
      console.error('[AuthGuard] User not found in database');
      throw new UnauthorizedException('Unauthorized: User not found');
    }

    // Attach user to request
    request['user'] = user;
    return true;
  }
}

// In main.ts, register globally:
// app.useGlobalGuards(new AuthGuard(app.get(Reflector), app.get(DatabaseService)));
