import { Injectable } from '@nestjs/common';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { DatabaseService } from 'src/database/database.service';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';

@Injectable()
export class TemplateService {
  constructor (private databaseService: DatabaseService,private whatsappService: WhatsappService) {}
  create(createTemplateDto: CreateTemplateDto) {
    
  }

  findAll() {
    return `This action returns all template`;
  }

  findOne(id: number) {
    return `This action returns a #${id} template`;
  }

  update(id: number, updateTemplateDto: UpdateTemplateDto) {
    return `This action updates a #${id} template`;
  }

  remove(id: string) {
    return `This action removes a #${id} template`;
  }
}
