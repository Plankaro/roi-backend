import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateProspectDto {
  @IsString()
  @IsNotEmpty()
  shopify_id: string; // Maps to `id`

  @IsString()
  @IsNotEmpty()
  name: string; // Maps to `name`

  @IsString()
  @IsOptional()
  email?: string; // Maps to `email` (optional)

  @IsString()
  @IsNotEmpty()
  phone: string; 
  
  @IsOptional()
  @IsString()
  image?: string; // Maps to `title` (optional)
}

