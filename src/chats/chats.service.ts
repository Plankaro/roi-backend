import { Injectable, Body, InternalServerErrorException } from '@nestjs/common';
import { SendTemplateMessageDto } from './dto/template-chat';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';
import { ChatsGateway } from './chats.gateway';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class ChatsService {
  constructor(private readonly whatsappService: WhatsappService,private readonly chatsGateway:ChatsGateway,private readonly databaseService:DatabaseService ) {}
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
  async receiveMessage(receiveMessageDto: any) {
    try {
      console.log(receiveMessageDto);
      const { entry } = receiveMessageDto;
      console.log(JSON.stringify(receiveMessageDto));
      const processedResults = [];
  
      for (const individualEntry of entry) {
        for (const change of individualEntry.changes) {
          const { value } = change;
  
          // Process each message in parallel
          if (value.messages) {
            const messagePromises = value.messages.map(async (message) => {
              try {
                const result = await this.databaseService.chat.create({
                  data: {
                    chatId: message.id,
                    senderPhoneNo: message.from,
                    receiverPhoneNo: value.metadata.display_phone_number,
                    sendDate: new Date(),
                    body_type: message.type,
                    body_text: message.text?.body // Handle non-text messages
                  }
                });
                processedResults.push(result);
              } catch (error) {
                console.error('Error processing message:', error);
              }
            });
            await Promise.allSettled(messagePromises);
          }
  
          // Process each status update in parallel
          if (value.statuses) {
            const statusPromises = value.statuses.map(async (status) => {
              try {
                console.log(status);
                const result = await this.databaseService.chat.update({
                  where: { chatId: status.id },
                  data: { Status: status.status }
                });
                processedResults.push(result);
              } catch (error) {
                console.error('Error updating status:', error);
              }
            });
            await Promise.allSettled(statusPromises);
          }
        }
      }
  
      // Notify clients via WebSocket of all processed results
      this.chatsGateway.handleMessage(processedResults);
  
      return { success: true, processed: processedResults.length };
    } catch (error) {
      console.error('Error in receiveMessage:', error);
      throw new InternalServerErrorException(error||
        'Failed to fetch products from Shopify',
      );
    }
  }

  async sendMessage(sendChatDto:any) {
    const {recipientNo,message} = sendChatDto
    try {
      const sendMessage = await this.whatsappService.sendMessage(recipientNo, message)
      const result = await this.databaseService.chat.create({
        data: {
          chatId: sendMessage?.messages[0]?.id??"",
          senderPhoneNo: "15551365364",
          receiverPhoneNo: sendMessage?.contacts[0].input,
          sendDate: new Date(),
          body_type: "text",
          body_text: message // Handle non-text messages
        }
      });
      console.log(result)


  
      return result;
    } catch (error) {
      console.log(error);
       throw new InternalServerErrorException(
                'Failed to fetch products from Shopify',
              );

    }
  }

  async findAllChats(client: string, prospect: string) {
    try {
      const sanitizePhoneNumber = (phone: string) =>
        phone.startsWith('+') ? phone.slice(1) : phone;
  
      const chats = await this.databaseService.chat.findMany({
        where: {  // ✅ `where` clause is required
          OR: [
            {
              senderPhoneNo: sanitizePhoneNumber(client),
              receiverPhoneNo: sanitizePhoneNumber(prospect),
            },
            {
              senderPhoneNo: sanitizePhoneNumber(prospect),
              receiverPhoneNo: sanitizePhoneNumber(client),
            },
          ],
        },
      });
  
      console.log(chats);
      return chats;
    } catch (e) {
      throw new InternalServerErrorException('Failed to fetch messages');
    }
  }
  

  async findAllTemplate() {
    try {
      const Chats = await this.whatsappService.getTemplates();
      console.log(Chats);
      return Chats

    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch products from Shopify',
      );
    }
  }

  

  findOne(id: number) {
    return `This action returns a #${id} chat`;
  }


  remove(id: number) {
    return `This action removes a #${id} chat`;
  }
}
