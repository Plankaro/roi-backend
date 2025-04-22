import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { JobData } from './checkout-create-processor';
import { getFutureTimestamp, sanitizePhoneNumber } from 'utils/usefulfunction';

@Injectable()
@Processor('updateOrderQueue')
export class UpdateOrderProcessor extends WorkerHost {
  constructor(
    private readonly databaseService: DatabaseService,
    @InjectQueue('updateOrderCampaign')
    private readonly updateOrderCampaign: Queue,
  ) {
    super();
  }
  async process(job: Job<any>): Promise<void> {
    const { orderData, domain } = job.data;
    const contact =
      orderData.billing_address?.phone || orderData.customer?.phone;

    const sanitizedContact = sanitizePhoneNumber(contact);
    const updateOrder = await this.databaseService.order.findUnique({
      where: {
        shopify_id: orderData.id.toString(),
      },
    });
    if (!updateOrder) {
      console.log('No order found in the database for this shopify_id');
      return;
    }
    console.log('processing with order');

    const order_updated = await this.databaseService.order.update({
      where: {
        id: updateOrder.id,
      },

      data: {
        shopify_id: orderData.id.toString(),
        customer_phoneno: sanitizedContact,
        // propspect_id: prospect ? prospect.id : null, // Ensure prospect ID is mapped correctly
        status: orderData.financial_status,
        amount: orderData.current_total_price,
        Date: new Date(orderData.created_at),
        // fromBroadcast: true,
        // BroadCastId: latestBroadcast.id,/
        shopify_store: domain,
        order_status_url: orderData.order_status_url,
        processed_at: orderData.processed_at,
        cancel_reason: orderData.cancel_reason,
        cancelled_at: orderData.cancelled_at,
        cart_token: orderData.cart_token,
        checkout_id: String(orderData.checkout_id),
        checkout_token: orderData.checkout_token,
        closed_at: orderData.closed_at,
        confirmation_number: orderData.confirmation_number,
        confirmed: orderData.confirmed,
        contact_email: orderData.contact_email,
        created_at: orderData.created_at,
        currency: orderData.currency,
        discount_codes: orderData.discount_codes,
        fulfillment_status: orderData.fulfillment_status,

        landing_site: orderData.landing_site,
        updated_at: orderData.updated_at,
        total_weight: orderData.total_weight,
        merchant_business_entity_id: orderData.merchant_business_entity_id,
        name: orderData.name,
        order_number: orderData.order_number,
        shipping_lines: orderData.shipping_lines,
        shipping_address: orderData.shipping_address,
      },
    });

    const Campaigns = await this.databaseService.campaign.findMany({
      where: {
        // ✅ Add 'where'
        Business: {
          shopify_domain: domain, // ✅ Correct nested filtering
        },
        status: 'ACTIVE',
        trigger: 'ORDER_UPDATED',
      },
    });

    if (Campaigns.length > 0) {
      Campaigns.forEach((campaign) => {
        const time =
          campaign.trigger_type === 'AFTER_CAMPAIGN_CREATED'
            ? 0
            : getFutureTimestamp(campaign.trigger_time as any);
        this.updateOrderCampaign
          .add(
            'createOrderCampaignQueue',
            { campaignId: campaign.id, orderId: order_updated.id },

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
  }
  catch(error) {
    console.error('Error in manipulateOrder:', error);
  }
}
