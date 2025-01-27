import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DatabaseModule } from 'src/database/database.module';
import { JwtModule } from '@nestjs/jwt';
import { SendgridModule } from 'src/sendgrid/sendgrid.module';
@Module({
  imports:[DatabaseModule, JwtModule.register({}),SendgridModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
