import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { AuthGuard } from './auth/guards/authguard';
import { JwtModule, JwtService } from '@nestjs/jwt';

import { Reflector } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DatabaseService } from 'src/database/database.service';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  const reflector = app.get(Reflector); 
  const jwtService = app.get(JwtService); 


  app.useGlobalGuards(new AuthGuard(jwtService, reflector, app.get(DatabaseService)));
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
  app.enableCors(
    {
      origin: process.env.CLIENT_URL,
      credentials: true,
    }
  )
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();

