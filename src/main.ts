import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { AuthGuard } from './auth/guards/authguard';
import { JwtModule, JwtService } from '@nestjs/jwt';

import { Reflector } from '@nestjs/core';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  const reflector = app.get(Reflector); 
  const jwtService = app.get(JwtService); 

  // Register the AuthGuard globally
  // app.useGlobalGuards(new AuthGuard(jwtService, reflector));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      enableDebugMessages: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
    }),
  );
  app.enableCors()
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();

