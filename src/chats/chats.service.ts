import { Injectable, Body, InternalServerErrorException } from '@nestjs/common';
import { SendTemplateMessageDto } from './dto/template-chat';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';
import { ChatsGateway } from './chats.gateway';
import { DatabaseService } from 'src/database/database.service';
import { MediaDto } from './dto/media-chat-dto';
import { HeaderType } from '@prisma/client';

@Injectable()
export class ChatsService {
  constructor(
    private readonly whatsappService: WhatsappService,
    private readonly chatsGateway: ChatsGateway,
    private readonly databaseService: DatabaseService,
  ) {}
  async create(sendTemplateMessageDto: any) {
    const {
      body, // Array of body objects
      buttons, // Array of buttons
      header, // Header object
      language, // Language string
      parameter_format, // Format type
      recipientNo, // Recipient's phone number
      template_name,
      previewSection,
      template_type,
      // Template name
    } = sendTemplateMessageDto;

    console.log(JSON.stringify(sendTemplateMessageDto,null, 2));

    const components = [];
 

    if (header && header.isEditable) {
      if (header.type === 'TEXT') {
        // For text headers: include parameter_name only for NAMED templates.
        if (parameter_format === 'NAMED' && header.parameter_name) {
          components.push({
            type: 'header',
            parameters: [
              {
                type: 'text',
                parameter_name: header.parameter_name,
                text: header.value,
              },
            ],
          });
        } else {
          // For POSITIONAL templates, only include the text.
          components.push({
            type: 'header',
            parameters: [{ type: 'text', text: header.value }],
          });
        }
      } else if (header.type === 'IMAGE') {
        // For image headers, use the "image" key.
        components.push({
          type: 'header',
          parameters: [{ type: 'image', image: { link: header.value } }],
        });
      } else if (header.type === 'VIDEO') {
        // For video headers, use the "video" key.
        components.push({
          type: 'header',
          parameters: [{ type: 'video', video: { link: header.value } }],
        });
      } else if (header.type === 'DOCUMENT') {
        // For document headers, use the "document" key.
        components.push({
          type: 'header',
          parameters: [{ type: 'document', document: { link: header.value } }],
        });
      }
    }

    const bodyParameters = body.map((param) => {
      if (parameter_format === 'NAMED') {
        return {
          type: 'text',
          parameter_name: param.parameter_name, // e.g., "customer_name"
          text: param.value, // e.g., "John"
        };
      } else {
        // Default to positional
        return {
          type: 'text',
          text: param.value, // e.g., "John"
        };
      }
    });
    components.push({
      type: 'body',
      parameters: bodyParameters,
    });

    buttons.map((button,index) => {
      if(button.type === 'URL' && button.isEditable==true) {
        components.push({
          type: 'button',
          sub_type: 'url',
          index: "0",
          parameters: [
            {
              type: 'text',
              text: button.value,
            },
          ],
        })
      }
      else if(button.type === 'COPY_CODE' ) {
        components.push({
          type: 'button',
          sub_type: 'copy_code',
          index: index,
          parameters: [
            {
              type: 'otp',
              text: button.value,
            },
          ],
        })
      }
    })

    console.log(JSON.stringify(components,null, 2))
 
 
    // components.push({
    //   type: 'button',
    //   sub_type: 'url',
    //   index: '0',
    //   parameters: [
    //     {
    //       type: 'text',
    //       text: 'https://default-url.com',
    //     },
    //   ],
    // },
    // {
    //   type: 'button',
    //   sub_type: 'copy_code',
    //   index: '1',
    //   parameters: [
    //     {
    //       type: 'text',
    //       text: 'DEFAULT_CODE',
    //     },
    //   ],
    // },
    // {
    //   type: 'button',
    //   sub_type: 'phone_number',
    //   index: '2',
    //   parameters: [
    //     {
    //       type: 'text',
    //       text:'+1234567890',
    //     },
    //   ],
    // });

    try {
      const message: any = await this.whatsappService.sendTemplateMessage({
        recipientNo: recipientNo,
        templateName: template_name,
        languageCode: language,
        components: components,
      });
      console.log(message)

      const addTodb = await this.databaseService.chat.create({
        data: {
          chatId: message?.messages[0]?.id ?? '',
          template_used: true,
          template_name:template_name,
          senderPhoneNo: '15551365364',
          receiverPhoneNo: message?.contacts[0].input.replace(/^\+/, ''),
          sendDate: new Date(),
          header_type: previewSection.header.type,
          header_value: previewSection.header.value,
          body_text: previewSection.bodyText,
          footer_included:previewSection.footer.length > 0,
          footer_text:previewSection.footer,
          Buttons:previewSection.buttons,
          type:template_type


        },

      });
      return  addTodb;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error);
    }
  }
  async receiveMessage(receiveMessageDto: any) {
    try {
      console.log(JSON.stringify(receiveMessageDto, null, 2));

      const { entry } = receiveMessageDto;
     
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
                    // body_type: message.type,
                    body_text: message.text?.body,
                    Status: 'delivered',
                    type:"personal" // Handle non-text messages
                  },
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
          
                const result = await this.databaseService.chat.update({
                  where: { chatId: status.id },
                  data: { 
                    Status: status.status,
                    failedReason:status.errors[0].message
                   },
                  

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
      throw new InternalServerErrorException(
        error || 'Failed to fetch products from Shopify',
      );
    }
  }

  async sendMessage(sendChatDto: any) {
    console.log(sendChatDto);
    const { recipientNo, message } = sendChatDto;
    try {
      const sendMessage = await this.whatsappService.sendMessage(
        recipientNo,
        message,
      );
      const result = await this.databaseService.chat.create({
        data: {
          chatId: sendMessage?.messages[0]?.id ?? '',
          senderPhoneNo: '15551365364',
          receiverPhoneNo: sendMessage?.contacts[0].input,
          sendDate: new Date(),
          // body_type: 'text',
          body_text: message,
          type:"personal"
          // Handle non-text messages
        },
      });
 
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
        where: {
          // ✅ `where` clause is required
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

  
      return chats;
    } catch (e) {
      throw new InternalServerErrorException('Failed to fetch messages');
    }
  }

  async findAllTemplate() {
    try {
      console.log('fetching templates');
      const Chats = await this.whatsappService.getTemplates();

      return Chats.data;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Failed to fetch templates');
    }
  }
  async sendMedia(MediaDto:MediaDto) {
    try {
      function mapMediaTypeToHeaderType(mediaType: string): HeaderType {
        switch (mediaType.toLowerCase()) {
          case 'image':
            return HeaderType.IMAGE;
          case 'video':
            return HeaderType.VIDEO;
          case 'document':
            return HeaderType.DOCUMENT;
          case 'text':
            return HeaderType.TEXT;
          default:
            throw new Error(`Unsupported media type: ${mediaType}`);
        }
      }
      
      const sendMessage = await this.whatsappService.sendMedia(
        MediaDto.recipientNo,
        MediaDto.mediaUrl,
        MediaDto.type,
        MediaDto.caption,
      );
      const result = await this.databaseService.chat.create({
        data: {
          chatId: sendMessage?.messages[0]?.id ?? '',
          senderPhoneNo: '15551365364',
          receiverPhoneNo: sendMessage?.contacts[0].input,
          sendDate: new Date(),
          header_type:mapMediaTypeToHeaderType(MediaDto.type),
          header_value: MediaDto.mediaUrl,
          body_text: MediaDto.caption,
          type:"personal"
          // Handle non-text messages
        },
      });
  
      return result
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }
  
 
}
