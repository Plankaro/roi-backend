import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsController } from './chats.controller';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';
import { WhatsappModule } from 'src/whatsapp/whatsapp.module';

@Module({
  imports: [WhatsappModule],
  controllers: [ChatsController],
  providers: [ChatsService],
})
export class ChatsModule {}
