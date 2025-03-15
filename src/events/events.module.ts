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
import { UpdatedCheckoutQueue} from './processors/updated-checkout-processor';

@Module({
  imports: [
    DatabaseModule,
    ShopifyModule,
    WhatsappModule,
    BullModule.registerQueue(
      { name: 'createOrderQueue' },
      { name: 'createCheckoutQueue' },
      { name: 'createCheckoutCampaign' },
      { name:'updatedCheckoutQueue'}

    ),
  ],
  controllers: [EventsController],
  providers: [
    EventsService,
    CreateOrderQueue,
    CreateCheckoutQueue,
    CreateCheckoutCampaign,
    UpdatedCheckoutQueue
  ],
})
export class EventsModule {}
