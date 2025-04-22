import { IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class RazorpayDto {
  @IsNotEmpty({ message: 'Key ID is required' })
  @Type(() => String)
  keyId: string;

  @IsNotEmpty({ message: 'Key Secret is required' })
  @Type(() => String)
  keySecret: string;
}
