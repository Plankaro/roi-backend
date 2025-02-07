import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { AuthGuard } from './auth/guards/authguard';
import { JwtModule, JwtService } from '@nestjs/jwt';

import { Reflector } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  const reflector = app.get(Reflector); 
  const jwtService = app.get(JwtService); 


  // app.useGlobalGuards(new AuthGuard(jwtService, reflector));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      enableDebugMessages: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
    }),
  );
  
  const microservice = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: { port: 4001 },
  });

  await microservice.listen();
  app.enableCors()
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();

