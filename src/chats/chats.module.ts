import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';
import { WhatsappModule } from 'src/whatsapp/whatsapp.module';
import { ChatsGateway } from './chats.gateway';
import { DatabaseModule } from 'src/database/database.module';
import { ShopifyModule } from 'src/shopify/shopify.module';
import { BullModule } from '@nestjs/bullmq';
import { ReceiveChatsQueue } from './processor/receivechat-processor';

import { CustomersModule } from 'src/customers/customers.module';
import { GemniModule } from 'src/gemni/gemni.module';
import { BottransferQueue } from './processor/bot-transfer-processor';

@Module({
  imports: [
    WhatsappModule,
    DatabaseModule,
    CustomersModule,
    ShopifyModule,
    BullModule.registerQueue({ name: 'receiveChatsQueue' },
      { name: 'bottransferQueue'}
    ),
    GemniModule,
  ],
  controllers: [ChatsController],
  providers: [ChatsService, ChatsGateway, ReceiveChatsQueue,BottransferQueue],
})
export class ChatsModule {}
