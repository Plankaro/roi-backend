import { Module } from '@nestjs/common';
import { ProspectsService } from './prospects.service';
import { ProspectsController } from './prospects.controller';
import { DatabaseModule } from 'src/database/database.module';
import { WhatsappModule } from 'src/whatsapp/whatsapp.module';
@Module({
  imports: [DatabaseModule,WhatsappModule],
  controllers: [ProspectsController],
  providers: [ProspectsService],
})
export class ProspectsModule {}
