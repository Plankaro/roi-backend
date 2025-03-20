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

@Module({
  imports: [
    DatabaseModule,
    ShopifyModule,
    WhatsappModule,
    BullModule.registerQueue(
      { name: 'createOrderQueue' },
      { name: 'createOrderCampaign' },
      { name: 'updateOrderQueue' },
      { name: 'updateOrderCampaign' },
      { name: 'cancelOrderQueue' },
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
    CreateOrderCampaign
    
  ],
})
export class EventsModule {}
