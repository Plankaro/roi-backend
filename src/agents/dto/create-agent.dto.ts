import { IsString, IsNotEmpty, IsEmail, MinLength, Matches, IsOptional, IsBoolean } from 'class-validator';

export class CreateAgentDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: "Password must be at least 8 characters" })
  @Matches(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
  @Matches(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
  @Matches(/[0-9]/, { message: "Password must contain at least one number" })
  password: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsBoolean()

  ManageBroadcast: boolean = true;

  @IsBoolean()

  manageTeam: boolean = true;

  @IsBoolean()

  manageCampaign: boolean = true;

  @IsBoolean()

  assignChat: boolean = true;
}
