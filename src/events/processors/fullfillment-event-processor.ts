import { Processor, WorkerHost, InjectQueue } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { JobData } from './checkout-create-processor';
import { getFutureTimestamp, sanitizePhoneNumber } from 'utils/usefulfunction';
import { OrderMethod } from '@prisma/client';

export type ShopifyFulfillment = {
  id: string;
  order_id: string;
  status: 'success' | 'cancelled' | string;
  created_at: string;
  updated_at: string;
  service: string;
  tracking_company: string;
  shipment_status: OrderMethod;
  location_id: number;
  origin_address: null | Record<string, unknown>;
  email: string;
  destination: {
    first_name: string;
    address1: string;
    phone: string;
    city: string;
    zip: string;
    province: string;
    country: string;
    last_name: string;
    address2: string | null;
    company: string | null;
    latitude: number;
    longitude: number;
    name: string;
    country_code: string;
    province_code: string;
  };
  line_items: Array<{
    id: number;
    variant_id: number;
    title: string;
    quantity: number;
    sku: string;
    variant_title: string;
    vendor: string;
    fulfillment_service: string;
    product_id: number;
    requires_shipping: boolean;
    taxable: boolean;
    gift_card: boolean;
    name: string;
    variant_inventory_management: string;
    properties: any[];
    product_exists: boolean;
    fulfillable_quantity: number;
    grams: number;
    price: string;
    total_discount: string;
    fulfillment_status: 'fulfilled' | null;
    price_set: {
      shop_money: {
        amount: string;
        currency_code: string;
      };
      presentment_money: {
        amount: string;
        currency_code: string;
      };
    };
    total_discount_set: {
      shop_money: {
        amount: string;
        currency_code: string;
      };
      presentment_money: {
        amount: string;
        currency_code: string;
      };
    };
    discount_allocations: any[];
    duties: any[];
    admin_graphql_api_id: string;
    tax_lines: Array<{
      title: string;
      price: string;
      rate: number;
      channel_liable: boolean;
      price_set: {
        shop_money: {
          amount: string;
          currency_code: string;
        };
        presentment_money: {
          amount: string;
          currency_code: string;
        };
      };
    }>;
  }>;
  tracking_number: string;
  tracking_numbers: string[];
  tracking_url: string;
  tracking_urls: string[];
  receipt: Record<string, unknown>;
  name: string;
  admin_graphql_api_id: string;
};

@Injectable()
@Processor('createFullfillmentQueue')
export class FullfillmentEventProcessor extends WorkerHost {
  constructor(
    private readonly databaseService: DatabaseService,
    @InjectQueue('createFulfillmentCampaign')
    private readonly createFulfillmentCampaign: Queue,
  ) {
    super();
  }

  async process(job: Job<any>): Promise<void> {
    const {
      fullFillmentData,
      domain,
    }: { fullFillmentData: ShopifyFulfillment; domain: string } = job.data;
    try {
      console.log('hit route', domain);

      const findRelatedOrder = await this.databaseService.order.findUnique({
        where: { shopify_id: String(fullFillmentData.order_id) },
      });

      const createFullFillment = await this.databaseService.fulfillment.create({
        data: {
          shopify_id: String(fullFillmentData.id),
          orderId: String(fullFillmentData.order_id),
          service: fullFillmentData.service,
          order: { connect: { id: findRelatedOrder.id || null } },
          status: fullFillmentData.status,
          createdAt: new Date(fullFillmentData.created_at),
          updatedAt: new Date(fullFillmentData.updated_at),
          trackingCompany: fullFillmentData.tracking_company,
          shipmentStatus: fullFillmentData.shipment_status,
          locationId: BigInt(fullFillmentData.location_id),
          originAddress: fullFillmentData.origin_address as any,
          email: fullFillmentData.email,
          trackingNumber: fullFillmentData.tracking_number,
          trackingNumbers: fullFillmentData.tracking_numbers,
          trackingUrl: fullFillmentData.tracking_url,
          trackingUrls: fullFillmentData.tracking_urls,
          name: fullFillmentData.name,
          destination: fullFillmentData.destination,
          lineItems: fullFillmentData.line_items,
        },
      });

      const Campaigns = await this.databaseService.campaign.findMany({
        where: {
          // ✅ Add 'where'
          Business: {
            shopify_domain: domain, // ✅ Correct nested filtering
          },
          status: 'ACTIVE',
          trigger: 'FULFILLMENT_CREATED',
        },
      });
      console.log('Campaigns', Campaigns);
      if (Campaigns.length > 0) {
        Campaigns.forEach((campaign) => {
          const time =
            campaign.trigger_type === 'AFTER_CAMPAIGN_CREATED'
              ? 0
              : getFutureTimestamp(campaign.trigger_time as any);
          this.createFulfillmentCampaign
            .add(
              'createOrderCampaignQueue',
              {
                campaignId: campaign.id,
                fullfillmentId: createFullFillment.id,
              },

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
      }
    } catch (error) {
        console.log(error)
    }
  }
}
