import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { JobData } from './checkout-create-processor';
import { getFutureTimestamp, sanitizePhoneNumber } from 'utils/usefulfunction';
import { ShopifyFulfillment } from './fullfillment-event-processor';

@Injectable()
@Processor('createFullfillmentEventQueue')
export class UpdateFullfillmentEventProcessor extends WorkerHost {
  constructor(
    private readonly databaseService: DatabaseService,
    @InjectQueue('createFulfillmentEventCampaign')
    private readonly createFulfillmentEventCampaign: Queue,
  ) {
    super();
  }

  async process(job: Job<any>): Promise<void> {
    const { fullFillmentData, domain }: { fullFillmentData: ShopifyFulfillment; domain: string } = job.data;
    console.log("hit route", domain);

    try {
      const findRelatedOrder = await this.databaseService.order.findUnique({
        where: { shopify_id: String(fullFillmentData.order_id) },
      });

      const createFullFillment = await this.databaseService.fulfillment.upsert({
        where: {
          shopify_id: String(fullFillmentData.id),
        },
        create: {
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
        update: {
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
          Business: {
            shopify_domain: domain,
          },
          status: 'ACTIVE',
          trigger: 'FULFILLMENT_EVENT_CREATED',
        },
      });

      console.log("Campaigns", Campaigns);

      if (Campaigns.length > 0) {
        Campaigns.forEach((campaign) => {
          const time =
            campaign.trigger_type === 'AFTER_CAMPAIGN_CREATED'
              ? 0
              : getFutureTimestamp(campaign.trigger_time as any);
          this.createFulfillmentEventCampaign
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
      console.error(error);
    }
  }
}
