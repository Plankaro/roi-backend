import { IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class GoogleAnalyticsDto {
  @IsNotEmpty({ message: 'Measurement ID is required' })
  @Type(() => String)
  measurementId: string;

  @IsNotEmpty({ message: 'API Secret is required' })
  @Type(() => String)
  apiSecret: string;
}
