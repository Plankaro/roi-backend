import { Controller, Get, Post, Body, Patch, Param, Delete,Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterAuthDto } from './dto/register-auth-dto';
import { LoginDto } from './dto/login-auth.dto';
import { ForgetPasswordDto, VerifyOtpDto, ResetPasswordDto } from './dto/forget-password.dto';
import { Public } from './decorator/public.decorator';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('/login')
  login(@Body() LoginDto: LoginDto) {
    return this.authService.login(LoginDto);
  }

  @Public()
  @Post('/register')
  register(@Body() RegisterAuthDto: RegisterAuthDto) {
    return this.authService.register(RegisterAuthDto);
  }

  @Public()
  async refreshToken(
    @Param('id') userId: string,
    @Headers('authorization') authorization: string,
  ) {
    return this.authService.RefreshToken(userId,authorization);
  }

  @Public()
  @Post('/forget')
 forgetPassword(@Body() ForgetPasswordDto: ForgetPasswordDto) {

   return this.authService.forgetPassword(ForgetPasswordDto);
 }


 @Public()
 @Patch('/verify/:id')
 verify(@Param('id') id: string, @Body() VerifyOtpDto: VerifyOtpDto) {
   return this.authService.verifyOtp(id, VerifyOtpDto);
 }

 @Public()
 @Patch('/reset/:id')
 resetPassword(@Param('id') id: string, @Body() ResetPasswordDto: ResetPasswordDto) {
   return this.authService.ResetPassword(id, ResetPasswordDto);
 }
}
