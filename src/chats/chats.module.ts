import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';
import { WhatsappModule } from 'src/whatsapp/whatsapp.module';
import { ChatsGateway } from './chats.gateway';
import { DatabaseModule } from 'src/database/database.module';
import { ShopifyModule } from 'src/shopify/shopify.module';


@Module({
  imports: [WhatsappModule,DatabaseModule,ShopifyModule],
  controllers: [ChatsController],
  providers: [ChatsService, ChatsGateway],
})
export class ChatsModule {}
