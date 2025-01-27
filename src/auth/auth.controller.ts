import { Controller, Get, Post, Body, Patch, Param, Delete,Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterAuthDto } from './dto/register-auth-dto';
import { LoginDto } from './dto/login-auth.dto';
import { ResetPasswordDto,GetTokenDto } from './dto/forget-password.dto';
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
  @Post('/refresh-token')
  async refreshToken(
    
    @Headers('authorization') authorization: string,
  ) {
    return this.authService.RefreshToken(authorization);
  }

 


 @Public() // Marks this route as public (if applicable in your app logic).
 @Post('token-link') // Specify the route endpoint if needed.
 getTokenLink(@Body() GetTokenDto: GetTokenDto) {

   return this.authService.getTokenLink(GetTokenDto.email);
 }

 @Public() // Marks this route as public (if applicable in your app logic).
 @Get('verify-token/:id') // Specify the route endpoint if needed.
 verifyToken( @Param('id') token: string,) {
   return this.authService.verifyToken(token);
 }

 @Public() // Marks this route as public (if applicable in your app logic).
 @Post('reset-password/:id') // Specify the route endpoint if needed.
 resetPassword(@Body() resetPasswordDto: ResetPasswordDto, @Param('id') token: string,) {
   return this.authService.resetPassword(resetPasswordDto, token);
 }
}
