import { Module } from '@nestjs/common';
import { BroadcastService } from './broadcast.service';
import { BroadcastController } from './broadcast.controller';
import { WhatsappModule } from 'src/whatsapp/whatsapp.module';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [WhatsappModule, DatabaseModule],
  controllers: [BroadcastController],
  providers: [BroadcastService],
})
export class BroadcastModule {}
