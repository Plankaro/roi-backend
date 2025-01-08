import { IsEmail, IsString, MinLength, Matches } from 'class-validator';

export class RegisterAuthDto {
  @IsString()
  @MinLength(2, { message: "Name must be at least 2 characters" })
  name: string;

  @IsEmail({}, { message: "Please enter a valid email address" })
  email: string;

  @IsString()
  @Matches(/^\d{10,}$/, { message: "Please enter a valid phone number" })
  phone: string;

  @IsString()
  @MinLength(6, { message: "Password must be at least 6 characters" })
  password: string;
}

