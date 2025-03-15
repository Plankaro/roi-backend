// create-template.dto.ts

import {
    IsString,
    IsNotEmpty,
    IsEnum,
    IsOptional,
    IsArray,
    ValidateNested,
    IsDefined,
  } from 'class-validator';
  import { Type } from 'class-transformer';
  
  export enum TemplateCategory {
    AUTHENTICATION = "AUTHENTICATION",
    MARKETING = "MARKETING",
    UTILITY = "UTILITY",
  }
  
  export enum TemplateStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
  }
  
  // Base component class
  export abstract class ComponentDto {
    @IsString()
    type: string;
  }
  
  // ----------------------
  // Body Component
  // ----------------------
  export class BodyComponentDto extends ComponentDto {
    type: "BODY";
  
    @IsString()
    text: string;  // e.g., "Thank you for your order, {{1}}! Your confirmation number is {{2}}."
  
    @IsDefined()
    example: {
      body_text: string[][]; // e.g., [["Pablo", "860198-230332"]]
    };
  }
  
  // ----------------------
  // Button DTOs
  // ----------------------
  export abstract class ButtonDto {
    @IsString()
    type: string;
  }
  
  export class PhoneNumberButtonDto extends ButtonDto {
    type: "PHONE_NUMBER";
  
    @IsString()
    text: string; // e.g., "Call"
  
    @IsString()
    phone_number: string; // e.g., "15550051310"
  }
  
  export class UrlButtonDto extends ButtonDto {
    type: "URL";
  
    @IsString()
    text: string; // e.g., "Contact Support"
  
    @IsString()
    url: string; // e.g., "https://www.example.com/support"
  }
  
  // ----------------------
  // Buttons Component
  // ----------------------
  export class ButtonsComponentDto extends ComponentDto {
    type: "BUTTONS";
  
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ButtonDto, {
      discriminator: {
        property: 'type',
        subTypes: [
          { value: PhoneNumberButtonDto, name: 'PHONE_NUMBER' },
          { value: UrlButtonDto, name: 'URL' },
        ],
      },
      keepDiscriminatorProperty: true,
    })
    buttons: ButtonDto[];
  }
  
  // ----------------------
  // Carousel Component
  // ----------------------
  export class CarouselItemDto {
    @IsString()
    title: string;    // Title of the carousel card
  
    @IsString()
    subtitle: string; // Subtitle or description
  
    @IsString()
    imageUrl: string; // URL of the image
  
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ButtonDto, {
      discriminator: {
        property: 'type',
        subTypes: [
          { value: PhoneNumberButtonDto, name: 'PHONE_NUMBER' },
          { value: UrlButtonDto, name: 'URL' },
        ],
      },
      keepDiscriminatorProperty: true,
    })
    buttons?: ButtonDto[];
  }
  
  export class CarouselComponentDto extends ComponentDto {
    type: "CAROUSEL";
  
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CarouselItemDto)
    items: CarouselItemDto[];
  }
  
  // ----------------------
  // Create Template DTO
  // ----------------------
  export class CreateTemplateDto {
    @IsString()
    @IsNotEmpty()
    name: string; // e.g., "Order Confirmation"
  
    @IsString()
    languageCode: string; // e.g., "en_US"
  
    @IsEnum(TemplateCategory)
    category: TemplateCategory;
  
    @IsEnum(TemplateStatus)
    status: TemplateStatus;
  
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ComponentDto, {
      discriminator: {
        property: 'type',
        subTypes: [
          { value: BodyComponentDto, name: 'BODY' },
          { value: ButtonsComponentDto, name: 'BUTTONS' },
          { value: CarouselComponentDto, name: 'CAROUSEL' },
        ],
      },
      keepDiscriminatorProperty: true,
    })
    components: ComponentDto[];
  
    @IsOptional()
    @IsString()
    createdBy?: string;
  
    @IsOptional()
    @IsString()
    createdForId?: string;
  }
  