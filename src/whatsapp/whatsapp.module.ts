import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { DatabaseModule } from 'src/database/database.module';
import { ChatsModule } from 'src/chats/chats.module';

@Module({
  imports:[DatabaseModule],
  providers: [WhatsappService],
  exports: [WhatsappService],
})
export class WhatsappModule {}
