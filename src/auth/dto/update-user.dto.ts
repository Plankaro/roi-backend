import {
    IsOptional,
    IsString,
    MinLength,
    ValidateIf,
    Validate,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
  } from 'class-validator';
  import { Type } from 'class-transformer';
  
  @ValidatorConstraint({ name: 'PasswordsMatch', async: false })
  class PasswordsMatchConstraint implements ValidatorConstraintInterface {
    validate(_: any, args: ValidationArguments): boolean {
      // args.object is the entire DTO instance
      const dto = args.object as UpdateProfileDto;
  
      // If none of the password fields are provided, skip this check
      if (!dto.currentPassword && !dto.newPassword && !dto.confirmPassword) {
        return true;
      }
  
      // Otherwise, newPassword must equal confirmPassword
      return dto.newPassword === dto.confirmPassword;
    }
  
    defaultMessage(_args: ValidationArguments): string {
      return "New password and confirmation don't match";
    }
  }
  
  export class UpdateProfileDto {
    // ── Profile fields ──────────────────────────────────────────
  
    @IsOptional()
    @IsString()
    @MinLength(2, { message: 'Name must be at least 2 characters.' })
    @Type(() => String)
    name?: string;
  
    @IsOptional()
    @IsString()
    @Type(() => String)
    image?: string;
  
    // ── Password‑change fields ──────────────────────────────────
  
    @ValidateIf(o => o.currentPassword != null)
    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters.' })
    @Type(() => String)
    currentPassword?: string;
  
    @ValidateIf(o => o.newPassword != null)
    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters.' })
    @Type(() => String)
    newPassword?: string;
  
    @ValidateIf(o => o.confirmPassword != null)
    @IsString()
    @MinLength(8, { message: 'Password must be at least 8 characters.' })
    @Validate(PasswordsMatchConstraint)
    @Type(() => String)
    confirmPassword?: string;
  }
  