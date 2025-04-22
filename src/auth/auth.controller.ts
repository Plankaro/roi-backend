import { Controller, Get, Post, Body, Patch, Param, Delete,Headers, Query, Res, InternalServerErrorException, BadRequestException, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterAuthDto } from './dto/register-auth-dto';
import { LoginDto } from './dto/login-auth.dto';
import { ResetPasswordDto,GetTokenDto } from './dto/forget-password.dto';
import { Public } from './decorator/public.decorator';
import { Response } from 'express';
import axios from 'axios';
import { createHmac } from 'crypto';
import { UpdateProfileDto } from './dto/update-user.dto';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}


  @Get('/')
  getUser(@Req() req: Request) {
    return this.authService.getUser(req);
  }

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
    console.log("refreshing");
    return this.authService.RefreshToken(authorization);
  }

 
@Public()
@Post('/logout')
logout(@Body() userId: string) {
  return this.authService.logout(userId);
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

 @Patch('update')
 update(@Body() updateBotDto: UpdateProfileDto, @Req() req: Request){
   return this.authService.updateUser(updateBotDto,req);
 } // Specify the route endpoint if needed.

 @Public()
 @Get('/shopify/install')
 install(@Query('shop') shop: string,@Query('buisnessId') buisnessId: string,@Res() res: Response) {
  console.log(shop,buisnessId);
   return this.authService.installShopify(shop,res,buisnessId);
 }


 @Public()
 @Get('/shopify/callback')
 async callback(
   @Query() query: Record<string, string>,
   @Res() res: Response,
 ) {
   // Debug: log all incoming query params
   await this.authService.verfifyShopifyCallback(query, res);

}
}
