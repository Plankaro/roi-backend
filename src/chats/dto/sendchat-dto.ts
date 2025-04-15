import {
  IsString,
  IsEmail,
  IsBoolean,
  IsOptional,
  ValidateIf,
  IsNumber,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';


export enum HeaderType {
    IMAGE = 'IMAGE',
    VIDEO = 'VIDEO',
    DOCUMENT = 'DOCUMENT',
    TEXT = 'TEXT',
  }
  
export class SendMessageDto {
  @IsString()
  recipientNo: string;

  @IsString()
  message: string;

  @IsString()
  prospect_id: string;
}

export class HeaderDto {
  @IsString()
  type: HeaderType;

  // The value is optional initially.
  // Using ValidateIf, you can add custom validation if needed.
  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.isEditable && (!o.value || o.value.trim().length === 0))
  value?: string;

  @IsBoolean()
  isEditable: boolean;
}

// ---------------------
// Body Item DTO
// ---------------------

export class BodyItemDto {
  @IsString({ message: 'Parameter name is required' })
  parameter_name: string;

  // Require a non-empty string.
  @IsString({ message: 'Missing value' })
  value: string;
}

// ---------------------
// Button DTO
// ---------------------

export class ButtonDto {
  @IsString()
  type: string;

  @IsString()
  // When isEditable is true, value must be provided.
  @ValidateIf((o) => o.isEditable)
  value: string;

  @IsNumber()
  index: number;

  @IsBoolean()
  isEditable: boolean;

  @IsString()
  text: string;
}

// ---------------------
// Template Form DTO
// ---------------------

export class TemplateFormDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => HeaderDto)
  header?: HeaderDto;

  @ValidateNested({ each: true })
  @Type(() => BodyItemDto)
  body: BodyItemDto[];

  @ValidateNested({ each: true })
  @Type(() => ButtonDto)
  buttons: ButtonDto[];
}

export class SendTemplateMessageDto {
    @ValidateNested()
  @Type(() => TemplateFormDto)
  templateForm: TemplateFormDto;

  @IsString()
  recipientNo: string;

  @IsString()
  name: string;
}
