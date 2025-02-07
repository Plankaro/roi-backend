import { Module } from '@nestjs/common';
import { TemplateService } from './template.service';
import { TemplateController } from './template.controller';
import { WhatsappModule } from 'src/whatsapp/whatsapp.module';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports:[WhatsappModule,DatabaseModule],
  controllers: [TemplateController],
  providers: [TemplateService],
})
export class TemplateModule {}
