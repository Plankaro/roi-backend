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



@Module({
  imports: [WhatsappModule,DatabaseModule,ShopifyModule,BullModule.registerQueue({ name: 'receiveChatsQueue' })],
  controllers: [ChatsController],
  providers: [ChatsService, ChatsGateway,ReceiveChatsQueue],
})
export class ChatsModule {}
