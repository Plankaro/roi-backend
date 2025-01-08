import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterAuthDto } from './dto/register-auth-dto';
import { LoginDto } from './dto/login-auth.dto';
import { ForgetPasswordDto, VerifyOtpDto, ResetPasswordDto } from './dto/forget-password.dto';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  login(@Body() LoginDto: LoginDto) {
    return this.authService.login(LoginDto);
  }

  @Post('/register')
  register(@Body() RegisterAuthDto: RegisterAuthDto) {
    return this.authService.register(RegisterAuthDto);
  }

  @Post('/forget')
 forgetPassword(@Body() ForgetPasswordDto: ForgetPasswordDto) {

   return this.authService.forgetPassword(ForgetPasswordDto);
 }


 @Patch('/verify/:id')
 verify(@Param('id') id: string, @Body() VerifyOtpDto: VerifyOtpDto) {
   return this.authService.verifyOtp(id, VerifyOtpDto);
 }

 @Patch('/reset/:id')
 resetPassword(@Param('id') id: string, @Body() ResetPasswordDto: ResetPasswordDto) {
   return this.authService.ResetPassword(id, ResetPasswordDto);
 }
}
