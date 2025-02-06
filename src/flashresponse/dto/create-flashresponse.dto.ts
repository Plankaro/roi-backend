// src/flash-response/dto/create-flash-response.dto.ts
import { IsString, IsBoolean, IsOptional, Length } from 'class-validator';

export class CreateFlashresponseDto {
  @IsString()
  @Length(1, 10)
  short: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  createdBy?: string;

  @IsOptional()
  @IsString()
  createdForId?: string;

  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;
}

