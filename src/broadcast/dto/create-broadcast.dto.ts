import { IsBoolean, IsNotEmpty, IsOptional, IsString, ValidateIf, ValidateNested, Min, IsEnum, IsArray } from 'class-validator';
import { Type } from 'class-transformer';




export class UTMParameterDto {
  @IsBoolean()
  enabled: boolean;

  @ValidateIf((o) => o.enabled)
  @IsNotEmpty({ message: 'Value is required when enabled is true' })
  @IsString()
  value?: string;
}

export class UTMParametersDto {
  @ValidateNested()
  @Type(() => UTMParameterDto)
  utm_source: UTMParameterDto;

  @ValidateNested()
  @Type(() => UTMParameterDto)
  utm_medium: UTMParameterDto;

  @ValidateNested()
  @Type(() => UTMParameterDto)
  utm_campaign: UTMParameterDto;

  @IsBoolean()
  utm_id: boolean;

  @IsBoolean()
  utm_term: boolean;
}

export class SkipInactiveContactsDto {
    @IsBoolean()
    enabled: boolean;
  
    @ValidateIf((o) => o.enabled)
    @Min(1, { message: 'Days must be greater than 0' })
    days?: number;
  }

  export class LimitMarketingMessagesDto {
    @IsBoolean()
    enabled: boolean;
  
    @ValidateIf((o) => o.enabled)
    @Min(1, { message: 'At least 1 message required' })
    maxMessages?: number;
  
    @ValidateIf((o) => o.enabled)
    @Min(1, { message: 'Time range must be valid' })
    timeRange?: number;
  
    @ValidateIf((o) => o.enabled)
    @IsNotEmpty({ message: 'Time unit is required' })
    @IsString()
    timeUnit?: string;
  }
  
  export class AvoidDuplicateContactsDto {
    @IsBoolean()
    enabled: boolean;
  }
  
  export class ScheduleDto {
    @IsBoolean()
    schedule: boolean;
  
    @ValidateIf((o) => o.schedule)
    @IsOptional()
    date?: Date;
  
    @ValidateIf((o) => o.schedule)
    @IsNotEmpty({ message: 'Time is required when schedule is true' })
    @IsString()
    time?: string;
  }
  

export class AdvanceFiltersDto {
  @ValidateNested()
  @Type(() => SkipInactiveContactsDto)
  skipInactiveContacts: SkipInactiveContactsDto;

  @ValidateNested()
  @Type(() => LimitMarketingMessagesDto)
  limitMarketingMessages: LimitMarketingMessagesDto;

  @ValidateNested()
  @Type(() => AvoidDuplicateContactsDto)
  avoidDuplicateContacts: AvoidDuplicateContactsDto;
}




export class HeaderDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  value?: string;

  @IsOptional()
  @IsBoolean()
  isEditable?: boolean;

  @IsOptional()
  @IsBoolean()
  fromsegment?: boolean;

  @ValidateIf((o) => o.fromsegment)
  @IsNotEmpty({ message: 'Segment Name is required when fromsegment is true' })
  segmentname?: string;
}

export class BodyItemDto {
  @IsString()
  parameter_name: string;

  @IsString()
  value: string;

  @IsBoolean()
  fromsegment: boolean;

  @ValidateIf((o) => o.fromsegment)
  @IsNotEmpty({ message: 'Segment Name is required when fromsegment is true' })
  segmentname: string;
}

export class ButtonDto {
  @IsString()
  type: string;

  @IsString()
  value: string;

  @IsBoolean()
  isEditable: boolean;
}

export class TemplateFormDto {
  @ValidateNested()
  @Type(() => HeaderDto)
  header?: HeaderDto;

  @ValidateNested({ each: true })
  @Type(() => BodyItemDto)
  @IsArray()
  body: BodyItemDto[];

  @ValidateNested({ each: true })
  @Type(() => ButtonDto)
  @IsArray()
  buttons: ButtonDto[];
}

export enum OnLimitExceed {
  PAUSE = 'pause',
  SKIP = 'skip',
}

enum BroadcastType {
    PROMOTIONAL = 'promotional',
    TRANSACTIONAL = 'transactional',
  }
  

export class CreateBroadcastDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsEnum(Type, { message: 'Type must be promotional or transactional' })
  type: BroadcastType;

  @ValidateNested()
  @Type(() => TemplateFormDto)
  templateForm: TemplateFormDto;

  @IsOptional()
  contact?: any;

  @IsOptional()
  utmParameters?: any;

  @IsOptional()
  advanceFilters?: any;

  @IsEnum(OnLimitExceed)
  onlimitexced: OnLimitExceed;

  @IsOptional()
  schedule?: any;
}
