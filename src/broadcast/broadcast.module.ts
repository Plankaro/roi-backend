import { Module } from '@nestjs/common';
import { BroadcastService } from './broadcast.service';
import { BroadcastController } from './broadcast.controller';
import { WhatsappModule } from 'src/whatsapp/whatsapp.module';
import { DatabaseModule } from 'src/database/database.module';
import { BroadcastProcessor } from './broadcast.processor';
import { BullModule } from '@nestjs/bullmq';
import { CustomersModule } from 'src/customers/customers.module';
import { BroadcastRetryProcessor } from './broadcastretry.processor';

@Module({
  imports: [
    WhatsappModule,
    DatabaseModule,
    BullModule.registerQueue({ name: 'broadcastQueue' }),
    BullModule.registerQueue({ name: 'broadcastRetryQueue' }),
    CustomersModule,
  ],
  controllers: [BroadcastController],
  providers: [BroadcastService, BroadcastProcessor,BroadcastRetryProcessor],
})
export class BroadcastModule {}
