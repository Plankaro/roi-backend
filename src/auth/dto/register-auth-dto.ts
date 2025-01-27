import { IsEmail, IsString, MinLength, Matches, ValidateIf } from 'class-validator';

export class RegisterAuthDto {
  @IsString()
  @MinLength(2, { message: "First name must be at least 2 characters." })
  firstName: string;

  @IsString()
  @MinLength(2, { message: "Last name must be at least 2 characters." })
  lastName: string;

  @IsEmail({}, { message: "Please enter a valid email address." })
  email: string;

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
