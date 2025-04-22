import { IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class PixelDto {
  @IsNotEmpty({ message: 'Pixel ID is required' })
  @Type(() => String)
  pixelId: string;
}
