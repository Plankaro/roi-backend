import {
  Injectable,
  Body,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { SendTemplateMessageDto } from './dto/template-chat';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';
import { ChatsGateway } from './chats.gateway';
import { DatabaseService } from 'src/database/database.service';
import { MediaDto } from './dto/media-chat-dto';
import { Business, HeaderType } from '@prisma/client';
import {
  escapeRegExp,
  getFirstAndLastName,
  getWhatsappConfig,
  sanitizePhoneNumber,
} from 'utils/usefulfunction';
import { ShopifyService } from 'src/shopify/shopify.service';
import { Public } from 'src/auth/decorator/public.decorator';
import { Buisness } from 'src/buisness/entities/buisness.entity';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
@Injectable()
export class ChatsService {
  constructor(
    private readonly whatsappService: WhatsappService,
    private readonly chatsGateway: ChatsGateway,
    private readonly databaseService: DatabaseService,
    private readonly ShopifyService: ShopifyService,
    @InjectQueue('receiveChatsQueue') private readonly receiveChatsQueue: Queue,
  ) {}
  async sendTemplatemessage(sendTemplateMessageDto: any, req: any) {
  try {
      const {
        name,
        templateForm,
        recipientNo,
  
        // Template name
      } = sendTemplateMessageDto;
  
      console.log(JSON.stringify(sendTemplateMessageDto, null, 2));
      const user = req.user;
      const buisness = req.user.business;
      const components = [];
      const whatsappConfig = getWhatsappConfig(buisness);
      const response = await this.whatsappService.findSpecificTemplate(
        whatsappConfig,
        name,
      );
      const template = response?.data?.[0];
      console.log(template);
  
      if (!template) {
        throw new BadRequestException('Template not found');
      }
      const { header, body, buttons } = templateForm;
      if (header && header.isEditable) {
        let headerValue = '';
        if (header.type === 'TEXT') {
          headerValue = header.value;
          if (
            template.parameter_format === 'NAMED' &&
            template.components[0]?.example?.header_text_named_params?.[0]
              ?.param_name
          ) {
            components.push({
              type: 'header',
              parameters: [
                {
                  type: 'text',
                  parameter_name:
                    template.components[0].example.header_text_named_params[0]
                      .param_name,
                  text: headerValue,
                },
              ],
            });
          } else {
            components.push({
              type: 'header',
              parameters: [{ type: 'text', text: headerValue }],
            });
          }
        } else if (header.type === 'IMAGE') {
          components.push({
            type: 'header',
            parameters: [{ type: 'image', image: { link: header.value } }],
          });
        } else if (header.type === 'VIDEO') {
          components.push({
            type: 'header',
            parameters: [{ type: 'video', video: { link: header.value } }],
          });
        } else if (header.type === 'DOCUMENT') {
          components.push({
            type: 'header',
            parameters: [{ type: 'document', document: { link: header.value } }],
          });
        }
        console.log('Header processed with value:', headerValue);
      }
  
      // Process body component parameters
      const bodyParameters = body.map((param) => {
        const value = param.value || 'test';
        return template.parameter_format === 'NAMED'
          ? {
              type: 'text',
              parameter_name: param.parameter_name.replace(/{{|}}/g, ''),
              text: value,
            }
          : { type: 'text', text: value };
      });
      components.push({ type: 'body', parameters: bodyParameters });
      console.log('Body parameters processed:', bodyParameters);
  
      // Process buttons
      buttons.forEach((button, index) => {
        if (button.type === 'URL' && button.isEditable === true) {
          components.push({
            type: 'button',
            sub_type: 'url',
            index: index,
            parameters: [{ type: 'text', text: button.value }],
          });
        } else if (button.type === 'COPY_CODE') {
          components.push({
            type: 'button',
            sub_type: 'COPY_CODE',
            index: button.index,
            parameters: [
              {
                type: 'coupon_code', // Must be exactly "coupon_code" for copy_code buttons
                coupon_code: button.value, // The actual coupon code text you want to be copied
              },
            ],
          });
        }
      });
      console.log(JSON.stringify(components, null, 2));
  
      const params = {
          recipientNo: recipientNo,
          templateName: template.name,
          languageCode: template.language,
          components: components,
        
      }
      console.log(params);
      const sendTemplateMessage = await this.whatsappService.sendTemplateMessage(
       params,
        whatsappConfig,
      );
      console.log('Message sent successfully:', sendTemplateMessage);
      const footer = template.components.find(
        (component) => component.type === 'footer',
      );
      let bodycomponent = template.components.find(
        (component) => component.type.toLowerCase() === 'body',
      );
      console.log('Body component found:', bodycomponent);
      let bodyRawText = '';
      if (bodycomponent && bodycomponent.text) {
        bodyRawText = bodycomponent.text;
        const mapping = body.reduce((acc, param) => {
          acc[param.parameter_name] =  param.value;
          return acc;
        }, {});
        console.log('Mapping for body text:', mapping);
        Object.keys(mapping).forEach((placeholder) => {
          const escapedPlaceholder = escapeRegExp(placeholder);
          const regex = new RegExp(escapedPlaceholder, 'g');
          bodyRawText = bodyRawText.replace(regex, mapping[placeholder]);
        });
      } else {
        console.log('No valid body component text found.');
      }
      console.log('Final body raw text:', bodyRawText);
  
      let findContact = await this.databaseService.prospect.findUnique({
        where: {
          phoneNo:sanitizePhoneNumber(recipientNo)
        },
      })
      if (!findContact) {
        const addContact = await this.databaseService.prospect.create({
          data: {
            phoneNo: sanitizePhoneNumber(recipientNo),
            buisnessNo:buisness.whatsapp_mobile,
          },
        });
      
        findContact  = addContact;
      }
  
      const addTodb = await this.databaseService.chat.create({
        data: {
          chatId:sendTemplateMessage?.messages[0]?.id ?? '',
          prospectId: findContact.id,
          template_used: true,
          template_name: template.name,
          senderPhoneNo: sendTemplateMessage.creator.business.whatsapp_mobile,
          receiverPhoneNo: sanitizePhoneNumber(recipientNo),
          sendDate: new Date(),
          header_type: header?.type,
          header_value:
            header?.isEditable && header?.type === 'TEXT' && header?.value,
          body_text: bodyRawText,
          footer_included: footer ? true : false,
          footer_text: footer?.text || '',
          Buttons: buttons,
          type: template.type || 'text',
          template_components: components,
          senderId:user.id
         
         
          
        },
      });
      console.log(addTodb);
      return addTodb;
  } catch (error) {
    throw new InternalServerErrorException(error);
  }
    // } catch (error) {
    //   console.log(error);
    //   throw new InternalServerErrorException(error);
    // }
  }

  async receiveMessage(receiveMessageDto: any) {
    try {
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

  async sendMessage(sendChatDto: any, req: any) {
    console.log(sendChatDto);
    const { recipientNo, message, prospect_id } = sendChatDto;
    try {
      const buisness = req.user.business;
      const config = {
        whatsappMobileId: buisness.whatsapp_mobile_id,
        whatsappApiToken: buisness.whatsapp_token,
      };
  
      //   where: {
      //     buisnessNo_phoneNo: { // Correct format for compound unique constraint
      //       phoneNo: recipientNo as string,
      //       buisnessNo: '15551365364',

      //     }
      //   },
      //   update: {
      //     // Add the fields you want to update when the record exists
      //   },
      //   create: {
      //     phoneNo: recipientNo as string,
      //     buisnessNo: '15551365364',
      //     lead :"LEAD"
      //     // Add other required fields for new record creation
      //   }
      // });
      const sendMessage = await this.whatsappService.sendMessage(
        recipientNo,
        message,
        config,
      );
      const result = await this.databaseService.chat.create({
        data: {
          prospectId: prospect_id,
          chatId: sendMessage?.messages[0]?.id ?? '',
          senderPhoneNo: '15551365364',
          receiverPhoneNo: sendMessage?.contacts[0].input,
          sendDate: new Date(),
          // body_type: 'text',
          body_text: message,
          type: 'personal',
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

  async findAllChats(prospect_id: string, req: any) {
    try {
      const buisness = req.user.business;

      const chats = await this.databaseService.chat.findMany({
        where: {
          // ✅ `where` clause is required
          prospectId: prospect_id,
          deleted: false,
          Status: { not: 'skipped' },
        },
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
      const approvedTemplates = Templates?.data?.filter(
        (template) => 
          template.status === 'APPROVED' &&
          !template.components?.some(component => component.type === 'CAROUSEL')
      );



      return approvedTemplates;
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
    const config = {
      whatsappMobileId: buisness.whatsapp_mobile_id,
      whatsappApiToken: buisness.whatsapp_token,
    };

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
          // Handle non-text messages
        },
      });

      return result;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  // async getShopifyProspectUsingPhoneNumber(phoneNumber: string) {
  //   const query = `
  //     query getCustomerByPhone($query: String!) {
  //       customers(first: 1, query: $query) {
  //         edges {
  //           node {
  //             id
  //             firstName
  //             lastName
  //             email
  //             phone
  //                image {
  //             url
  //             src
  //           }
  //           }
  //         }
  //       }
  //     }
  //   `;
  //   const variables = {
  //     query: `phone:${phoneNumber}`,
  //   };

  //   try {
  //     console.log(JSON.stringify(variables));
  //     const result = await this.ShopifyService.executeGraphQL(query, variables);
  //     if (result.data.customers.edges && result.data.customers.edges.length > 0) {
  //       return result.data.customers.edges[0].node;
  //     }
  //     return null;
  //   } catch (error) {
  //     console.error('Error executing GraphQL query:', error);
  //     throw new InternalServerErrorException(
  //       'Failed to fetch customer data from Shopify'
  //     );
  //   }
  // }

  // async createShopifyusingPhoneNumber(data: { firstName?: string; lastName?: string; phone?: string }) {
  //   const query = `mutation createCustomer($input: CustomerInput!) {
  //     customerCreate(input: $input) {
  //       customer {
  //         id
  //         firstName
  //         lastName
  //         email
  //         phone
  //            image {
  //             url
  //             src
  //           }
  //       }
  //       userErrors {
  //         field
  //         message
  //       }
  //     }
  //   }`;
  //   const variables = { input: data };
  //   const response = await this.ShopifyService.executeGraphQL(query, variables);
  //   if (response.data.customerCreate && response.data.customerCreate.customer) {
  //     return response.data.customerCreate.customer;
  //   } else {
  //     throw new InternalServerErrorException('Failed to create customer on Shopify');
  //   }
  // }

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

  async markMessageAsRead(prospectorId: string, req, ids: string[]) {
    try {
      const buisness: Business = req.user.business;

      // const findprospect = await this.databaseService.prospect.findUnique({
      //   where: {
      //     id:prospectorId
      //   }
      // })
      // const chats = await this.databaseService.chat.findMany({
      //   where: {
      //     prospectId:prospectorId,
      //     deleted:false,
      //     receiverPhoneNo:findprospect.phoneNo
      //   }
      // })
      const config = getWhatsappConfig(buisness);
      ids.forEach(async (chat) => {
        const updatechat = await this.whatsappService.markstatusasread(
          chat,
          config,
        );
        console.log(updatechat);
      });

      return 'success';
    } catch (error) {
      console.error(error);
    }
  }
}
