import {
  Injectable,
  Body,
  InternalServerErrorException,
  BadRequestException,

} from '@nestjs/common';

import { WhatsappService } from 'src/whatsapp/whatsapp.service';
import { ChatsGateway } from './chats.gateway';
import { DatabaseService } from 'src/database/database.service';
import { MediaDto } from './dto/media-chat-dto';
import { Business, HeaderType } from '@prisma/client';
import {
  escapeRegExp,
  getFirstAndLastName,
  getWhatsappConfig,
  isTemplateButtonRedirectSafe,
  sanitizePhoneNumber,
} from 'utils/usefulfunction';
import { ShopifyService } from 'src/shopify/shopify.service';
import { Public } from 'src/auth/decorator/public.decorator';
import { Buisness } from 'src/buisness/entities/buisness.entity';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { console } from 'inspector';
import { connect } from 'http2';
import { SendMessageDto,SendTemplateMessageDto } from './dto/sendchat-dto';
import { Logger } from '@nestjs/common';

@Injectable()
export class ChatsService {
  constructor(
    private readonly whatsappService: WhatsappService,
    private readonly chatsGateway: ChatsGateway,
    private readonly databaseService: DatabaseService,
    private readonly ShopifyService: ShopifyService,
    @InjectQueue('receiveChatsQueue') private readonly receiveChatsQueue: Queue,
  ) {}
  async sendTemplatemessage(sendTemplateMessageDto: SendTemplateMessageDto, req: any) {
    try {
      const {
        name,
        templateForm,
        recipientNo,
      } = sendTemplateMessageDto;
  
      console.log('--- Incoming Request DTO ---');
      console.log(JSON.stringify(sendTemplateMessageDto, null, 2));
  
      const user = req.user;
      const buisness = req.user.business;
      console.log('--- Business Info ---');
      console.log(buisness);
  
      const components = [];
      const whatsappConfig = getWhatsappConfig(buisness);
      console.log('--- WhatsApp Config ---');
      console.log(whatsappConfig);
  
      const response = await this.whatsappService.findSpecificTemplate(
        whatsappConfig,
        name,
      );
  
      const template = response?.data?.[0];
      const linkTrackenabled = isTemplateButtonRedirectSafe(template);
      console.log('--- Template Response ---');
      console.log(JSON.stringify(template, null, 2));
  
      if (!template) {
        console.error('❌ Template not found');
        throw new BadRequestException('Template not found');
      }
  
      const { header, body, buttons } = templateForm;

      console.log(JSON.stringify(templateForm, null, 2))

  
      // Process header
      if (header && header.isEditable) {
        console.log('--- Processing Header ---');
        let headerValue = '';
        if (header.type === 'TEXT') {
          headerValue = header.value;
          console.log('Header value (TEXT):', headerValue);
  
          if (
            template.parameter_format === 'NAMED' &&
            template.components[0]?.example?.header_text_named_params?.[0]
              ?.param_name
          ) {
            const paramName =
              template.components[0].example.header_text_named_params[0]
                .param_name;
            components.push({
              type: 'header',
              parameters: [{ type: 'text', parameter_name: paramName, text: headerValue }],
            });
          } else {
            components.push({
              type: 'header',
              parameters: [{ type: 'text', text: headerValue }],
            });
          }
        } else {
          console.log(`Header value (${header.type}):`, header.value);
          const mediaType = header.type.toLowerCase();
          components.push({
            type: 'header',
            parameters: [{ type: mediaType, [mediaType]: { link: header.value } }],
          });
        }
      }
  
      let trackurl:string;
      let trackId:string;
      // Process body
      console.log('--- Processing Body Parameters ---');
      const bodyParameters = body.map((param) => {
        const value = param.value || 'test';
        console.log(`Param: ${param.parameter_name}, Value: ${value}`);
        return template.parameter_format === 'NAMED'
          ? {
              type: 'text',
              parameter_name: param.parameter_name.replace(/{{|}}/g, ''),
              text: value,
            }
          : { type: 'text', text: value };
      });
      components.push({ type: 'body', parameters: bodyParameters });
  
      // Process buttons into components
      console.log('--- Processing Buttons into Components ---');
      for (const [index, button] of buttons.entries()) {
        console.log(`Button [${index}]:`, button);
      
        if (button.type === 'URL' && button.isEditable) {
          
          if (!linkTrackenabled) {
            components.push({
              type: 'button',
              sub_type: 'url',
              index,
              parameters: [{ type: 'text', text: button.value }],
            });
          } else {
            const url = await this.databaseService.linkTrack.create({
              data:{
                link: button.value,
                buisness_id: buisness.id,
                utm_source:"roi_magnet",
                utm_medium:"whatsapp",
                is_test_link:true,

              }
            });
            trackId=url.id;
      
            components.push({
              type: 'button',
              sub_type: 'url',
              index,
              parameters: [{ type: 'text', text: trackId }], // maybe use url instead of button.value?
            });
          }
        } else if (button.type === 'COPY_CODE') {
          components.push({
            type: 'button',
            sub_type: 'COPY_CODE',
            index: button.index,
            parameters: [
              {
                type: 'coupon_code',
                coupon_code: button.value,
              },
            ],
          });
        }
      }
      console.log(JSON.stringify(components, null, 2));
      
  
      const params = {
        recipientNo: recipientNo,
        templateName: template.name,
        languageCode: template.language,
        components: components,
      };
      console.log('--- Final Message Params to be Sent ---');
      console.log(JSON.stringify(params, null, 2));
  
      const sendTemplateMessage =
        await this.whatsappService.sendTemplateMessage(params, whatsappConfig);
  
      console.log('✅ Message sent successfully:', sendTemplateMessage);
  
      // Parse template body text and replace named variables
      const footer = template.components.find((c) => c.type === 'footer');
      let bodycomponent = template.components.find(
        (c) => c.type.toLowerCase() === 'body',
      );
  
      let bodyRawText = '';
      if (bodycomponent && bodycomponent.text) {
        bodyRawText = bodycomponent.text;
        const mapping = body.reduce((acc, param) => {
          acc[param.parameter_name] = param.value;
          return acc;
        }, {});
        console.log('--- Body Text Placeholder Mapping ---', mapping);
  
        Object.keys(mapping).forEach((placeholder) => {
          const escapedPlaceholder = escapeRegExp(placeholder);
          const regex = new RegExp(escapedPlaceholder, 'g');
          bodyRawText = bodyRawText.replace(regex, mapping[placeholder]);
        });
      } else {
        console.warn('⚠️ No valid body component text found.');
      }
      console.log('Final body raw text:', bodyRawText);
  
      // Check or create prospect
      let findContact = await this.databaseService.prospect.findUnique({
        where: {
        //  buisnessNo_phoneNo: {
        //    buisnessNo: buisness.whatsapp_mobile,
        //    phoneNo: sanitizePhoneNumber(recipientNo),
        //  }
        buisnessId_phoneNo: {
          buisnessId: buisness.id,
          phoneNo: sanitizePhoneNumber(recipientNo),
        }
        },
      });
  
      // if (!findContact) {
      //   console.log('Prospect not found. Creating new...');
      //   const addContact = await this.databaseService.prospect.create({
      //     data: {
      //       phoneNo: sanitizePhoneNumber(recipientNo),
      //       buisnessId: buisness.id
      //     },
      //   });
      //   findContact = addContact;
      // }
  
      // Replace placeholder in URL buttons from template
      console.log('--- Updating Button URLs ---');
      const updatedButtons = buttons.map((button) => {
        if (button.type === 'URL' && button.isEditable === true) {
          const findButtonfromtemplate = template.components.find(
            (component) => component.type === 'BUTTONS'
          );
          if (findButtonfromtemplate) {
            const templateUrlButton = findButtonfromtemplate.buttons.find(
              (btn) => btn.type === 'URL'
            );
            if (templateUrlButton && templateUrlButton.url) {
              console.log('Original template URL:', templateUrlButton.url);
              const placeholder = '{{1}}';
              const finalUrl = templateUrlButton.url.split(placeholder).join(linkTrackenabled? trackId : button.value);
              console.log('✅ Final URL:', finalUrl);
              return {
                ...button,
                value: finalUrl,
              };
            }
          }
        }
        return button;
      });
  
      console.log('--- Updated Buttons ---');
      console.log(JSON.stringify(updatedButtons, null, 2));
  
      const addTodb = await this.databaseService.chat.create({
        data: {
          chatId: sendTemplateMessage?.messages[0]?.id ?? '',
          prospectId: findContact.id,
          template_used: true,
          template_name: template.name,
          senderPhoneNo: buisness.whatsapp_mobile,
          receiverPhoneNo: sanitizePhoneNumber(recipientNo),
          sendDate: new Date(),
          header_type: header?.type,
          header_value: header?.isEditable? header?.value:null,
          body_text: bodyRawText,
          footer_included: footer ? true : false,
          footer_text: footer?.text || '',
          Buttons: updatedButtons,
          type: template.type || 'text',
          template_components: components,
          senderId: user.id,
        },
      });
console.log(addTodb);
      if(linkTrackenabled && trackId){
       await this.databaseService.linkTrack.update({
          where:{
            id:trackId,
          },
          data:{
            chat_id:addTodb.id
          }
        })
      }
  
      console.log('✅ Chat saved to DB:', addTodb);
      return addTodb;
    } catch (error) {
      Logger.error(error);
      console.error('❌ Error in sendTemplatemessage:', error);
      throw new InternalServerErrorException(error);
    }
  }
  

  async receiveMessage(receiveMessageDto: any) {
    try {
      console.log(JSON.stringify(receiveMessageDto, null, 2));
      await this.receiveChatsQueue.add(
        'receiveMessage',
        { receiveMessageDto: receiveMessageDto },
        {
          removeOnComplete: true,
          delay: 0,
          attempts: 2, // Retry on failure up to 2 times
          priority: 1, // Set job priority to 1
        },
      );
      return { sucess: true };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async sendMessage(sendChatDto: SendMessageDto, req: any) {

    const { recipientNo, message, prospect_id } = sendChatDto;
    try {
      const buisness = req.user.business;
      Logger.log(sendChatDto);
      const config = getWhatsappConfig(buisness);

   
      const sendMessage = await this.whatsappService.sendMessage(
        recipientNo,
        message,
        config,
      );
      const result = await this.databaseService.chat.create({
        data: {
          prospectId: prospect_id,
          chatId: sendMessage?.messages[0]?.id ?? '',
          senderPhoneNo: buisness.whatsapp_mobile,
          receiverPhoneNo: sendMessage?.contacts[0].input,
          sendDate: new Date(),
          // body_type: 'text',
          body_text: message,
          type: 'personal',
          senderId: req.user.id,
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

  async findAllChats(prospect_id: string, req: any) {
    try {
      const buisness = req.user.business;

      const chats = await this.databaseService.chat.findMany({
        where: {
          // ✅ `where` clause is required
          Prospect:{
            id:prospect_id,
            business:{
              id:buisness.id
            }
          },
          
          deleted: false,
          Status: { not: 'skipped' },
        },
        include:{
          sender: {
            select: {
              name: true,
              id: true,
              image: true
            },
          }
        }
      });

      return chats;
    } catch (e) {
      throw new InternalServerErrorException('Failed to fetch messages');
    }
  }

  async findAllTemplate(req: any) {
    const buisness = req.user.business;
    const config = getWhatsappConfig(buisness);

    try {
      console.log('fetching templates');
      const Templates = await this.whatsappService.getTemplates(config);
      console.log(Templates.data);
      console.log(typeof Templates.data);
      const approvedTemplatesWithTracking = Templates?.data
      ?.filter(
        (template) =>
          template.status === 'APPROVED' &&
          !template.components?.some(
            (component) => component.type === 'CAROUSEL',
          )
      )
      .map((template) => ({
        ...template,
        trackingEnabled: isTemplateButtonRedirectSafe(template),
      }));
    

      return approvedTemplatesWithTracking;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Failed to fetch templates');
    }
  }

  async getSpecificTemplates(name: string, req: any) {
    console.log(name);
    try {
      const config = getWhatsappConfig(req.user.business);
      const Templates = await this.whatsappService.findSpecificTemplate(
        config,
        name,
      );
      console.log(Templates);
      return Templates;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Failed to fetch templates');
    }
  }
  async sendMedia(MediaDto: MediaDto, req: any) {
    const buisness: Business = req.user.business;
    const config = getWhatsappConfig(buisness);

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
        config,
        MediaDto.caption,
      );
      const result = await this.databaseService.chat.create({
        data: {
          prospectId: MediaDto.prospectId,
          chatId: sendMessage?.messages[0]?.id ?? '',
          senderPhoneNo: buisness.whatsapp_mobile,
          receiverPhoneNo: sendMessage?.contacts[0].input,
          sendDate: new Date(),
          header_type: mapMediaTypeToHeaderType(MediaDto.type),
          header_value: MediaDto.mediaUrl,
          body_text: MediaDto.caption,
          type: 'personal',
          senderId: req.user.id,
        },
      });

      return result;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }



  async deleteMessage(prospectorId: string) {
    try {
      const result = await this.databaseService.chat.updateMany({
        where: {
          prospectId: prospectorId,
        },
        data: {
          deleted: true,
        },
      });
      return result;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async markMessageAsRead(prospectorId: string, req: any) {
    try {
      const business: Business = req.user.business;
      const config = getWhatsappConfig(business);
  
      // Step 1: Find relevant chats
      const chats = await this.databaseService.chat.findMany({
        where: {
          prospectId: prospectorId,
          deleted: false,
          receiverPhoneNo: business.whatsapp_mobile,
        },
      });
  
      // Step 2: Bulk update to mark all as 'read'
      await this.databaseService.chat.updateMany({
        where: {
          prospectId: prospectorId,
          deleted: false,
          receiverPhoneNo: business.whatsapp_mobile,
        },
        data: {
          Status: 'read',
        },
      });
  
      
      // Step 3: Concurrently mark each message as read on WhatsApp
      
  
      return 'success';
    } catch (error) {
      console.error('Error in markMessageAsRead:', error);
      throw new Error('Failed to mark messages as read');
    }
  }


    
  
}
