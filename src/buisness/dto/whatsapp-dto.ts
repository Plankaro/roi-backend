import { IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class WhatsappFormDto {
  @IsNotEmpty({ message: 'Whatsapp mobile ID is required' })
  @IsString()
  @Type(() => String)
  whatsapp_mobile_id: string;

  @IsNotEmpty({ message: 'Whatsapp mobile is required' })
  @IsString()
  @Type(() => String)
  whatsapp_mobile: string;

  @IsNotEmpty({ message: 'Whatsapp token is required' })
  @IsString()
  @Type(() => String)
  whatsapp_token: string;

  @IsNotEmpty({ message: 'Whatsapp business ID is required' })
  @IsString()
  @Type(() => String)
  whatsapp_buisness_id: string;

  @IsNotEmpty({ message: 'Whatsapp app ID is required' })
  @IsString()
  @Type(() => String)
  whatsapp_app_id: string;
}
