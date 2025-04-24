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
  @Matches(/^(?:(?:\+[0-9]{1,3})|0)?[0-9]{10}$/, {
    message:
      'Please enter a valid phone number: exactly 10 digits, optionally prefixed with 0 or a +<country code>',
  })
  phone: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsBoolean()

  ManageBroadcast: boolean = true;

  @IsBoolean()
  manageBots: boolean = true;

  @IsBoolean()

  manageCampaign: boolean = true;

  @IsBoolean()

  assignChat: boolean = true;
}
