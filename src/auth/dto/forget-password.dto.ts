import {IsEmail, IsNumber, IsString, MinLength } from "class-validator";

export class ForgetPasswordDto{
    @IsEmail({},{message:"enter a valid email address"})
    email:string;
}

export class VerifyOtpDto{
    @IsNumber({},{message:"enter a valid otp"})
    otp:number;
}

export class ResetPasswordDto{
    @IsString()
    @MinLength(6,{message:"Password must be at least 6 characters"})
    password:string
}