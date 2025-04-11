import { WorkerHost, Processor } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { getFutureTimestamp, sanitizePhoneNumber } from 'utils/usefulfunction';

interface ShopifyCheckoutWebhookData {
  id: number;
  token: string;
  billing_address:any;
  cart_token: string;
  email: string;
  gateway: string | null;
  buyer_accepts_marketing: boolean;
  buyer_accepts_sms_marketing: boolean;
  sms_marketing_phone: string | null;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  landing_site: string;
  note: string;
  note_attributes: any[]; // Adjust if you have a known structure
  referring_site: string;
  shipping_lines: any[]; // Adjust if needed
  shipping_address: any[]; // Adjust if needed
  taxes_included: boolean;
  total_weight: number;
  currency: string;
  completed_at: string | null;
  phone: string;
  customer_locale: string;
  line_items: any[];
  name: string;
  abandoned_checkout_url: string;
  discount_codes: any[]; // Adjust if needed
  tax_lines: any[];
  presentment_currency: string;
  source_name: string;
  total_line_items_price: string;
  total_tax: string;
  total_discounts: string;
  subtotal_price: string;
  total_price: string;
  total_duties: string;
  device_id: string | null;
  user_id: string | null;
  location_id: string | null;
  source_identifier: string | null;
  source_url: string | null;
  source: string | null;
  closed_at: string | null;
  customer: any;
  payment_gateway_id: string | null;
  processed_at: Date | null;
}

interface ShopifyLineItem {
  key: string;
  fulfillment_service: string;
  gift_card: boolean;
  grams: number;
  presentment_title: string;
  presentment_variant_title: string;
  product_id: number;
  quantity: number;
  requires_shipping: boolean;
  sku: string;
  tax_lines: any[];
  taxable: boolean;
  title: string;
  variant_id: number;
  variant_title: string;
  variant_price: string;
  vendor: string;
  unit_price_measurement: UnitPriceMeasurement;
  compare_at_price: string | null;
  line_price: string;
  price: string;
  applied_discounts: any[]; // Adjust if you know the structure
  destination_location_id: string | null;
  user_id: string | null;
  rank: number | null;
  origin_location_id: string | null;
  properties: { [key: string]: any }; // Adjust if needed
}

interface ShopifyTaxLine {
  position?: number;
  price: string;
  rate: number;
  title: string;
  source?: string;
  compare_at?: string | null;
  zone?: string;
  channel_liable?: boolean;
  identifier?: string | null;
}

interface UnitPriceMeasurement {
  measured_type: string | null;
  quantity_value: number | null;
  quantity_unit: string | null;
  reference_value: number | null;
  reference_unit: string | null;
}

interface ShopifyCustomer {
  id: number;
  email: string;
  accepts_marketing: boolean;
  created_at: string | null;
  updated_at: string | null;
  first_name: string;
  last_name: string;
  orders_count: number;
  state: string;
  total_spent: string;
  last_order_id: number;
  note: string | null;
  verified_email: boolean;
  multipass_identifier: string | null;
  tax_exempt: boolean;
  phone: string;
  tags: string;
  currency: string;
  accepts_marketing_updated_at: string | null;
  admin_graphql_api_id: string;
  default_address: ShopifyAddress;
  last_order_name: string | null;
  marketing_opt_in_level: string | null;
}

interface ShopifyAddress {
  id: number | null;
  customer_id: number;
  first_name: string;
  last_name: string;
  company: string | null;
  address1: string;
  address2: string | null;
  city: string;
  province: string;
  country: string;
  zip: string;
  phone: string;
  name: string;
  province_code: string;
  country_code: string;
  country_name: string;
  default: boolean;
}
export interface JobData {
  checkOutData: ShopifyCheckoutWebhookData;
  domain: string;
}

@Processor('createCheckoutQueue')
@Injectable()
export class CreateCheckoutQueue extends WorkerHost {
  constructor(
    private readonly databaseService: DatabaseService,
    @InjectQueue('createCheckoutCampaign')
    private readonly createCheckoutCampaignQueue: Queue,
  ) {
    super();
  }

  async process(job: Job<any>): Promise<void> {
    try {
 
      const { checkOutData, domain }: JobData = job.data;

      if (!checkOutData.token) return;
    
      const findBuisness = await this.databaseService.business.findUnique({
        where: {
          shopify_domain: domain,
        },
      })

      const checkout = await this.databaseService.checkout.create({
        data: {
          domain: domain,
          shopify_id: `${checkOutData.id}`,
          token: checkOutData.token,
          cartToken: checkOutData.cart_token,
          email: checkOutData.email,
          gateway: checkOutData.gateway,
          createdAt: checkOutData.created_at,
          updatedAt: checkOutData.updated_at,
          landingSite: checkOutData.landing_site,
          note: checkOutData.note,
          noteAttributes: checkOutData.note_attributes,
          currency: checkOutData.currency,
          completedAt: checkOutData.completed_at,
          phone: sanitizePhoneNumber(checkOutData?.customer?.phone),
          customerLocale: checkOutData.customer_locale,
          lineItems: checkOutData.line_items,
          name: checkOutData.name,
          abandonedCheckoutUrl: checkOutData.abandoned_checkout_url,
          discountCodes: checkOutData.discount_codes,
          taxLines: checkOutData.tax_lines,
          presentmentCurrency: checkOutData.presentment_currency,
          sourceName: checkOutData.source_name,
          totalLineItemsPrice: checkOutData.total_line_items_price,
          totalTax: checkOutData.total_tax,
          totalDiscounts: checkOutData.total_discounts,
          subtotalPrice: checkOutData.subtotal_price,
          totalPrice: checkOutData.total_price,
          totalDuties: checkOutData.total_duties,
          
          customer: checkOutData.customer,
          
          source: checkOutData.source,
          closedAt: checkOutData.closed_at,
          for_campaign: false,
          shipping_address: checkOutData.shipping_address,
          billingAddress: checkOutData.billing_address, // ensure this key exists on checkOutData
          // or update as needed if different from shipping_address
          
          processedAt: checkOutData.processed_at,
          businessId: findBuisness.id
    
       
          // campaigns field is a relation; you can associate related campaigns here if necessary.
          // For example, you might connect existing campaigns using:
          // campaigns: { connect: [{ id: someCampaignId }] },
        },
      });
  
      const Campaigns = await this.databaseService.campaign.findMany({
        where: {
          Business: { shopify_domain: domain },
          status: 'ACTIVE',
          trigger: 'CHECKOUT_CREATED',
        },
       
      });

      if (Campaigns.length === 0) return;

      Campaigns.forEach((campaign) => {

        const time =campaign.trigger_type ==="AFTER_CAMPAIGN_CREATED"? 0: getFutureTimestamp(campaign.trigger_time as any)
        this.createCheckoutCampaignQueue
          .add(
            'createCheckoutCampaign',
            { campaignId: campaign.id,checkoutId: checkout.id },
            
            {
              delay: time,
              removeOnComplete: true,
            },
          )
          .then((job) => {
            console.log('Job added to createCheckoutCampaignQueue:', job.id);
          })
          .catch((error) => {
            console.error('Error adding job:', error);
          });
      });
    } catch (error) {
      console.log(error);
    }
  }
}
