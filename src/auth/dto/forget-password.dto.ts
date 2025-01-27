import {IsEmail, IsNumber, IsString, Matches, MinLength, ValidateIf } from "class-validator";


export class ResetPasswordDto{
    @IsString()
      @MinLength(8, { message: "Password must be at least 8 characters." })
      @Matches(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
      @Matches(/[a-z]/, { message: "Password must contain at least one lowercase letter." })
      @Matches(/[0-9]/, { message: "Password must contain at least one number." })
      password: string;
    
      @IsString()
      @ValidateIf((dto) => dto.password)
      confirmPassword: string;
    
}

export class GetTokenDto{
    @IsEmail({}, { message: "Please enter a valid email address" })
    email: string
}