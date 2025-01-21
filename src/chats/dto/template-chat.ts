import {
    IsNotEmpty,
    IsString,
    IsArray,
    IsOptional,
    ValidateNested,
  } from 'class-validator';
  import { Type } from 'class-transformer';
  
  class TemplateLanguageDto {
    @IsNotEmpty()
    @IsString()
    code: string; // Language code (e.g., 'en_US', 'es_ES')
  }
  
  class ComponentParameterDto {
    @IsNotEmpty()
    @IsString()
    type: string; // Type of the parameter (e.g., 'text', 'button', etc.)
  
    @IsOptional()
    @IsString()
    text?: string; // Text content for parameters (optional)
  
    @IsOptional()
    @IsString()
    sub_type?: string; // Subtype for buttons (e.g., URL, quick reply) if applicable
  
    @IsOptional()
    @IsString()
    index?: string; // Index for buttons or placeholders
  }
  
  class TemplateComponentDto {
    @IsNotEmpty()
    @IsString()
    type: string; // Component type (e.g., 'header', 'body', 'buttons')
  
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => ComponentParameterDto)
    parameters?: ComponentParameterDto[]; // Parameters for this component
  }
  
  export class SendTemplateMessageDto {
    @IsNotEmpty()
    @IsString()
    recipientNo: string; // The recipient's phone number in international format
  
    @IsNotEmpty()
    @IsString()
    templateName: string; // Name of the WhatsApp template to use
  
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => TemplateLanguageDto)
    languageCode: TemplateLanguageDto; // Language details for the template
  
    @IsNotEmpty()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TemplateComponentDto)
    components: TemplateComponentDto[]; // Template components (header, body, buttons)
  }
  