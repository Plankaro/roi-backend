import { IsString, IsOptional, IsEnum, IsUrl } from 'class-validator';

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
}

export class MediaDto {
  @IsString()
  recipientNo: string;

  @IsString()
 
  prospectId: string; // Maps to `id`

  @IsUrl()
  mediaUrl: string;

  @IsEnum(MediaType)
  type: MediaType;

  @IsOptional()
  @IsString()
  caption?: string;
}
