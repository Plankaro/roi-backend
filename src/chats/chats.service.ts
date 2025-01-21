import { Injectable, Body } from '@nestjs/common';
import { SendTemplateMessageDto } from './dto/template-chat';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';
@Injectable()
export class ChatsService {
  constructor(private readonly whatsappService: WhatsappService) {}
  async create(sendTemplateMessageDto:any) {
    console.log(sendTemplateMessageDto);
    try {
      const message = await this.whatsappService.sendTemplateMessage(
        sendTemplateMessageDto
      )
      return message;
    } catch (error) {
      console.log(error);
    }
  }

  async sendMessage(recipientNo: string, message: string) {
    try {
      const result = await this.whatsappService.sendMessage(recipientNo, message)
      return result;
    } catch (error) {
      console.log(error);
    }
  }

  async findAllTemplate() {
    try {
      const Chats = await this.whatsappService.getTemplates();
      console.log(Chats);
      return Chats

    } catch (error) {
      return error.message;
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} chat`;
  }

  // update(id: number, updateChatDto: UpdateChatDto) {
  //   return `This action updates a #${id} chat`;
  // }

  remove(id: number) {
    return `This action removes a #${id} chat`;
  }
}
