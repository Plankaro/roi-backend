import { IsString, MinLength,IsOptional } from 'class-validator';
export class CreateBuisnessDto {
  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  businessName: string;

  @IsString()
  createdBy: string;

  @IsOptional()
  @IsString()
  shopifyApi:string
}

