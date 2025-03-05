import { IsString, IsOptional, IsBoolean, Length } from 'class-validator';

export class CreateFlashresponseDto {
  @IsString()
  @Length(1, 155)
  heading: string;

  @IsString()
  @Length(1, 255)
  category: string;

  @IsString()
  message: string;



  @IsOptional()
  @IsBoolean()
  shareWithOthers?: boolean;
}
