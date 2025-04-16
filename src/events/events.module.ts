import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { DatabaseModule } from 'src/database/database.module';
import { BullModule } from '@nestjs/bullmq';
import { CreateOrderQueue } from './processors/order-create-processor';
import { CreateCheckoutQueue } from './processors/checkout-create-processor';
import { ShopifyModule } from 'src/shopify/shopify.module';
import { WhatsappModule } from 'src/whatsapp/whatsapp.module';
import { CreateCheckoutCampaign } from './processors/create-checkout-campaign-processor';
import { UpdatedCheckoutQueue } from './processors/updated-checkout-processor';
import { CreateOrderCampaign } from './processors/order-create-campaign';
import { updateOrderCampaign } from './processors/update-order-campaign';
import { cancelOrderQueue } from './processors/cancel-order-processor';
import { cancelOrderCampaign } from './processors/cancel-order-campaign';
import { orderTagsAddedCampaign } from './processors/order-tag-added-campaign';
import { RazorpayModule } from 'src/razorpay/razorpay.module';
import { UpdateOrderProcessor } from './processors/update-order-processor';
import { FullfillmentEventProcessor } from './processors/fullfillment-event-processor';
import { FullfillmentEventCampaign } from './processors/fullfillment-event-campaign';
import { UpdateFullfillmentCampaignProcessor } from './processors/fullfillment-update-campaign';
import { UpdateFullfillmentEventProcessor } from './processors/fullfillment-update-processor';


@Module({
  imports: [
    DatabaseModule,
    RazorpayModule,
    ShopifyModule,
    WhatsappModule,
    BullModule.registerQueue(
      { name: 'createOrderQueue' },
      { name: 'createOrderCampaign' },
      { name: 'updateOrderQueue' },
      { name: 'updateOrderCampaign' },
      { name: 'cancelOrderQueue' },
      { name: 'orderTagsAddedCampaign'},
      { name: 'cancelOrderCampaign' },
      { name: 'createCheckoutQueue' },
      { name: 'createCheckoutCampaign' },
      { name: 'updatedCheckoutQueue' },
      { name: 'createFullfillmentQueue' },
      { name: 'createFulfillmentCampaign' },
      { name: 'createFullfillmentEventQueue' },
      { name: 'createFulfillmentEventCampaign' },

    ),
  ],
  controllers: [EventsController],
  providers: [
    EventsService,
    CreateOrderQueue,
    CreateCheckoutQueue,
    CreateCheckoutCampaign,
    UpdatedCheckoutQueue,
    CreateOrderCampaign,
    updateOrderCampaign,
    cancelOrderQueue,
    cancelOrderCampaign,
    orderTagsAddedCampaign,
    UpdateOrderProcessor,
    FullfillmentEventProcessor,
    FullfillmentEventCampaign,
    UpdateFullfillmentCampaignProcessor,
    UpdateFullfillmentEventProcessor
    
    
    
    
  ],
})
export class EventsModule {}
