import {
  IsString,
  IsNotEmpty,
  IsEnum,
  ValidateIf,
  IsBoolean,
  IsOptional,
  ValidateNested,
  IsObject,
  IsArray,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

// Enums – you can also import these from a shared constants file if available.
export enum CampaignType {
  ORDER_CREATED = 'ORDER_CREATED',
  ORDER_UPDATED = 'ORDER_UPDATED',
  ORDER_CANCELLED = 'ORDER_CANCELLED',
  CHECKOUT_CREATED = 'CHECKOUT_CREATED',
  FULFILLMENT_CREATED = 'FULFILLMENT_CREATED',
  FULFILLMENT_EVENT_CREATED = 'FULFILLMENT_EVENT_CREATED',
  ORDER_TAG_ADDED = 'ORDER_TAG_ADDED',
}

export class TimeDto {
    @IsNumber()
    time: number;
  
    @IsEnum(['minutes', 'hours', 'days'], {
      message: 'Unit must be one of: minutes, hours, days',
    })
    unit: 'minutes' | 'hours' | 'days';
  }
  

export enum CampaignStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export enum trigger_type {
  AFTER_EVENT = 'AFTER_EVENT',
  CUSTOM = 'CUSTOM',
}

export enum discount_type {
  PERCENTAGE = 'PERCENTAGE',
  AMOUNT = 'AMOUNT',
}

export enum campaign_trigger_type {
  AFTER_CAMPAIGN_CREATED = 'AFTER_CAMPAIGN_CREATED',
  CUSTOM = 'CUSTOM',
}

export enum PaymentOptionType {
  PAID = 'PAID',
  UNPAID = 'UNPAID',
}

export enum OrderMethod {
  confirmed = 'confirmed',
  label_printed = 'label_printed',
  label_purchases = 'label_purchases',
  ready_for_pickup = 'ready_for_pickup',
  picked_up = 'picked_up',
  in_transit = 'in_transit',
  out_for_delivery = 'out_for_delivery',
  attemped_delivery = 'attemped_delivery',
  failed_delivery = 'failed_delivery',
  delivered = 'delivered',
}

export enum AmountFilterType {
    GREATER = 'greater',
    LESS = 'less',
    CUSTOM = 'custom',
  }
  

// HEADER DTO
export class HeaderDto {
  @IsString()
  @IsNotEmpty({ message: 'Type is required' })
  type: string;

  // Only required when fromsegment is false.
  @IsOptional()
  @IsString()
  @ValidateIf((o: HeaderDto) => o.fromsegment === false)
  @IsNotEmpty({ message: 'Missing header value' })
  value?: string;

  @IsBoolean()
  isEditable: boolean;

  @IsBoolean()
  fromsegment: boolean;

  // Only required when fromsegment is true.
  @IsString()
  @ValidateIf((o: HeaderDto) => o.fromsegment === true)
  @IsNotEmpty({ message: 'Segment name is required' })
  segmentname: string;
}

// BODY ITEM DTO
export class BodyItemDto {
  @IsString()
  @IsNotEmpty({ message: 'Parameter name is required' })
  parameter_name: string;

  // Only required when fromsegment is false.
  @IsOptional()
  @IsString()
  @ValidateIf((o: BodyItemDto) => o.fromsegment === false)
  @IsNotEmpty({ message: 'Missing value' })
  value?: string;

  @IsBoolean()
  fromsegment: boolean;

  // Only required when fromsegment is true.
  @IsString()
  @ValidateIf((o: BodyItemDto) => o.fromsegment === true)
  @IsNotEmpty({ message: 'Segment name is required' })
  segmentname: string;
}

// BUTTON DTO
export class ButtonDto {
  // When the button is editable and not sourced from a segment, type is required.
  @IsString()
  @ValidateIf(
    (o: ButtonDto) => o.isEditable === true && o.fromsegment === false,
  )
  @IsNotEmpty({ message: 'Button type is required' })
  type: string;

  // When the button is editable and not sourced from a segment, value is required.
  @IsString()
  @ValidateIf(
    (o: ButtonDto) => o.isEditable === true && o.fromsegment === false,
  )
  @IsNotEmpty({ message: 'Button value is required' })
  value: string;

  @IsBoolean()
  isEditable: boolean;

  @IsString()
  text: string;

  @IsBoolean()
  fromsegment: boolean;

  // When fromsegment is true, segmentname is required.
  @IsString()
  @ValidateIf((o: ButtonDto) => o.fromsegment === true)
  @IsNotEmpty({ message: 'Segment Name is required' })
  segmentname: string;
}

// TEMPLATE FORM DTO
export class TemplateFormDto {
  // Header is optional
  @IsOptional()
  @ValidateNested()
  @Type(() => HeaderDto)
  header?: HeaderDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BodyItemDto)
  body: BodyItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ButtonDto)
  buttons: ButtonDto[];
}

// DTO for the template details.


// DTO for the filter details.
export class CreateFilterDto {
    // Order Tags
    @IsBoolean()
    is_order_tag_filter_enabled: boolean;
    @IsArray()
    @IsString({ each: true })
    order_tag_filter_all: string[];
    @IsArray()
    @IsString({ each: true })
    order_tag_filter_any: string[];
    @IsArray()
    @IsString({ each: true })
    order_tag_filter_none: string[];
  
    // Product Tags
    @IsBoolean()
    is_product_tag_filter_enabled: boolean;
    @IsArray()
    @IsString({ each: true })
    product_tag_filter_all: string[];
    @IsArray()
    @IsString({ each: true })
    product_tag_filter_any: string[];
    @IsArray()
    @IsString({ each: true })
    product_tag_filter_none: string[];
  
    // Customer Tags
    @IsBoolean()
    is_customer_tag_filter_enabled: boolean;
    @IsArray()
    @IsString({ each: true })
    customer_tag_filter_all: string[];
    @IsArray()
    @IsString({ each: true })
    customer_tag_filter_any: string[];
    @IsArray()
    @IsString({ each: true })
    customer_tag_filter_none: string[];
  
    // Payment Gateways
    @IsBoolean()
    is_payment_gateway_filter_enabled: boolean;
    @IsArray()
    @IsString({ each: true })
    payment_gateway_filter_any: string[];
    @IsArray()
    @IsString({ each: true })
    payment_gateway_filter_none: string[];
  
    // Payment Options
    @IsBoolean()
    is_payment_option_filter_enabled: boolean;
    @IsOptional()
    @IsEnum(PaymentOptionType)
    payment_options_type?: PaymentOptionType;
  
    @IsOptional()
    @IsBoolean()
    is_send_to_unsub_customer_filter_enabled?: boolean;

    @IsOptional()
    @IsBoolean()
    send_to_unsub_customer?: boolean;
  
    // Order Amount: Remove the filter type field; only keep numeric boundaries.
    @IsBoolean()
    is_order_amount_filter_enabled: boolean;

    @IsOptional()
    @IsEnum(AmountFilterType)
    order_amount_filter_type: AmountFilterType;

    @IsOptional()
    @IsNumber()
    order_amount_filter_greater_or_equal?: number;
    @IsOptional()
    @IsNumber()
    order_amount_filter_less_or_equal?: number;
    @IsOptional()
    @IsNumber()
    order_amount_min?: number;
    @IsOptional()
    @IsNumber()
    order_amount_max?: number;
  
    // Discount Amount: Remove the discount amount filter type; keep the numeric boundaries.
    @IsBoolean()
    is_discount_amount_filter_enabled: boolean;

    @IsOptional()
    @IsEnum(AmountFilterType)
    discount_amount_filter_type: AmountFilterType;
    @IsOptional()
    @IsNumber()
    discount_amount_filter_greater_or_equal?: number;
    @IsOptional()
    @IsNumber()
    discount_amount_filter_less_or_equal?: number;
    @IsOptional()
    @IsNumber()
    discount_amount_min?: number;
    @IsOptional()
    @IsNumber()
    discount_amount_max?: number;
  
    // Discount Codes
    @IsBoolean()
    is_discount_code_filter_enabled: boolean;
    
    @IsArray()
    @IsString({ each: true })
    discount_code_filter_any: string[];
    @IsArray()
    @IsString({ each: true })
    discount_code_filter_none: string[];

    @IsBoolean()  
    is_order_count_filter_enabled: boolean;

    @IsOptional()
    @IsEnum(AmountFilterType)
    order_count_filter_type: AmountFilterType;

    @IsOptional()
    @IsNumber()
    order_count_greater_or_equal: number;

    @IsOptional()
    @IsNumber()
    order_count_less_or_equal: number;
    @IsOptional()
    @IsNumber()
    order_count_min: number;
    @IsOptional()
    @IsNumber()
    order_count_max: number;
    
    // Order Delivery
    @IsBoolean()
    is_order_delivery_filter_enabled: boolean;
    @IsOptional()
    @IsEnum(OrderMethod)
    order_method?: OrderMethod;
  }
  
// DTO for creating a campaign.
export class CreateCampaignDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsEnum(CampaignType)
  trigger: CampaignType;


  @IsString()
  @IsNotEmpty()
  template_name: string;
  
  @IsString()
  @IsNotEmpty()
  template_language: string;
  
  @IsString()
  @IsNotEmpty()
  template_category: string;

  
  @IsString()
  @IsNotEmpty()
  reply_action: string;



  @IsEnum(campaign_trigger_type)
  trigger_type: campaign_trigger_type;

  @ValidateNested()
  @Type(() => TemplateFormDto)
  templateForm: TemplateFormDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => TimeDto)
  trigger_time?: TimeDto;

  @IsBoolean()
  filter_condition_match: boolean;

  @IsBoolean()
  new_checkout_abandonment_filter: boolean;

  @IsOptional()
  @IsEnum(trigger_type)
  new_checkout_abandonment_type?: trigger_type;

  @IsOptional()
  @ValidateNested()
  @Type(() => TimeDto)
  new_checkout_abandonment_time?: TimeDto;

  @IsOptional()
  @IsBoolean()
  new_order_creation_filter?: boolean;

  @IsEnum(trigger_type)
  new_order_creation_type: trigger_type;

  @IsOptional()
  @ValidateNested()
  @Type(() => TimeDto)
  new_order_creation_time?: TimeDto;

  @IsOptional()
  @IsBoolean()
  related_order_created: boolean;

  // Note: In your function, you assign related_order_cancelled from a property named related_order_fullfilled.
  @IsOptional()
  @IsBoolean()
  related_order_cancelled: boolean;




  @IsOptional()
  @IsBoolean()
  related_order_fulfilled: boolean;

  

  @IsOptional()
  @IsBoolean()
 is_discount_given: boolean;

  @IsEnum(discount_type)
  @IsOptional()
  discount_type: discount_type;

  @ValidateIf((o) => o.discount_type)
  @IsNumber({}, { message: 'Discount is required if discount_type is set' })
  discount?: number;

  @ValidateNested()
  @Type(() => CreateFilterDto)
  filter: CreateFilterDto;
}


