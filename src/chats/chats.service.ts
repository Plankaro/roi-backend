import { Injectable, Body, InternalServerErrorException } from '@nestjs/common';
import { SendTemplateMessageDto } from './dto/template-chat';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';
import { ChatsGateway } from './chats.gateway';
import { DatabaseService } from 'src/database/database.service';
import { MediaDto } from './dto/media-chat-dto';
import { HeaderType } from '@prisma/client';
import { getFirstAndLastName, sanitizePhoneNumber } from 'utils/usefulfunction';
import { ShopifyService } from 'src/shopify/shopify.service';
@Injectable()
export class ChatsService {
  constructor(
    private readonly whatsappService: WhatsappService,
    private readonly chatsGateway: ChatsGateway,
    private readonly databaseService: DatabaseService,
    private readonly ShopifyService: ShopifyService
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
      const prospect = await this.databaseService.prospect.upsert({
        where: {
          buisnessNo_phoneNo: { // Correct format for compound unique constraint
            phoneNo: recipientNo as string,
            buisnessNo: '15551365364'
          }
        },
        update: {
          // Add the fields you want to update when the record exists
        },
        create: {
          phoneNo: recipientNo as string,
          buisnessNo: '15551365364',
          lead :"LEAD"
          // Add other required fields for new record creation
        }
      });
      
      const message: any = await this.whatsappService.sendTemplateMessage({
        recipientNo: recipientNo,
        templateName: template_name,
        languageCode: language,
        components: components,
      });
      console.log(message)

      const addTodb = await this.databaseService.chat.create({
        data: {
          prospectId:prospect.id,
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
          type:template_type||"text"


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
      
      const { entry } = receiveMessageDto;
      const processedResults = [];
  
      for (const individualEntry of entry) {
        for (const change of individualEntry.changes) {
          const { value } = change;
          const businessPhoneNumber = sanitizePhoneNumber(value.metadata.display_phone_number);
      // Receiver's phone number
  
          if (value.messages) {
            const messagePromises = value.messages.map(async (message) => {
              try {
                const rawPhoneNumber = `+${sanitizePhoneNumber(message.from)}`;
  
                let prospect = await this.databaseService.prospect.findUnique({
                  where: {
                    buisnessNo_phoneNo: {
                      phoneNo: sanitizePhoneNumber(message.from),
                      buisnessNo: businessPhoneNumber,
                    },
                  },
                });
  
                if (!prospect) {
                  const name = getFirstAndLastName(value.contacts?.[0]?.profile?.name);
                  let shopifyCustomer = await this.createShopifyusingPhoneNumber({
                    firstName: name.firstName,
                    lastName: name.lastName,
                    phone: rawPhoneNumber,
                  });
  
                  prospect = await this.databaseService.prospect.create({
                    data: {
                      shopify_id: shopifyCustomer?.id?.match(/\d+$/)?.[0] ?? null,
                      phoneNo: sanitizePhoneNumber(message.from),
                      buisnessNo: businessPhoneNumber,
                      image: shopifyCustomer?.image?.url ?? null,
                      lead: "LEAD",
                      name: shopifyCustomer
                        ? `${shopifyCustomer.firstName} ${shopifyCustomer.lastName}`
                        : value.contacts?.[0]?.profile?.name,
                      email: shopifyCustomer?.email ?? null,
                    },
                  });
                   // Send prospect update to clients subscribed to the business phone
                this.chatsGateway.sendMessageToSubscribedClients(
                  businessPhoneNumber,
                  "prospect",
                  prospect
                );
                }
  
               
  
                const chatMessage = await this.databaseService.chat.create({
                  data: {
                    prospectId: prospect.id,
                    chatId: message.id,
                    senderPhoneNo: message.from,
                    receiverPhoneNo: businessPhoneNumber,
                    sendDate: new Date(),
                    body_text: message.text?.body,
                    Status: "delivered",
                    type: "personal",
                  },
                });
                processedResults.push(chatMessage);
  
       
                this.chatsGateway.sendMessageToSubscribedClients(
                  businessPhoneNumber,
                  "messages",
                  chatMessage
                );
              } catch (error) {
                console.error("Error processing message:", error);
              }
            });
  
            await Promise.allSettled(messagePromises);
          }
  
          if (value.statuses) {
            const statusPromises = value.statuses.map(async (status) => {
              try {
                const updatedChat = await this.databaseService.chat.update({
                  where: { chatId: status.id },
                  data: {
                    Status: status.status,
                    failedReason: status.errors?.[0]?.message ?? null,
                  },
                });
                processedResults.push(updatedChat);
  
                this.chatsGateway.sendMessageToSubscribedClients(
                  businessPhoneNumber,
                  "messages",
                  updatedChat
                );
              } catch (error) {
                console.error("Error updating status:", error);
              }
            });
            await Promise.allSettled(statusPromises);
          }
        }
      }
  
      return { success: true, processed: processedResults.length };
    } catch (error) {
      console.error("Error in receiveMessage:", error);
      throw new InternalServerErrorException(
        error || "Failed to process messages from Shopify"
      );
    }
  }
  
  
  async sendMessage(sendChatDto: any) {
    console.log(sendChatDto);
    const { recipientNo, message,prospect_id } = sendChatDto;
    try {

      // const prospect = await this.databaseService.prospect.upsert({
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
      );
      const result = await this.databaseService.chat.create({
        data: {
          prospectId:prospect_id,
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

  async findAllChats(prospect_id:string) {
    try {
      

      const chats = await this.databaseService.chat.findMany({
        where: {
          // ✅ `where` clause is required
        prospectId:prospect_id,

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
          prospectId:MediaDto.prospectId,
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
  
  async getShopifyProspectUsingPhoneNumber(phoneNumber: string) {
    const query = `
      query getCustomerByPhone($query: String!) {
        customers(first: 1, query: $query) {
          edges {
            node {
              id
              firstName
              lastName
              email
              phone
                 image {
              url
              src
            }
            }
          }
        }
      }
    `;
    const variables = {
      query: `phone:${phoneNumber}`,
    };

    try {
      console.log(JSON.stringify(variables));
      const result = await this.ShopifyService.executeGraphQL(query, variables);
      if (result.data.customers.edges && result.data.customers.edges.length > 0) {
        return result.data.customers.edges[0].node;
      }
      return null;
    } catch (error) {
      console.error('Error executing GraphQL query:', error);
      throw new InternalServerErrorException(
        'Failed to fetch customer data from Shopify'
      );
    }
  }

  async createShopifyusingPhoneNumber(data: { firstName?: string; lastName?: string; phone?: string }) {
    const query = `mutation createCustomer($input: CustomerInput!) {
      customerCreate(input: $input) {
        customer {
          id
          firstName
          lastName
          email
          phone
             image {
              url
              src
            }
        }
        userErrors {
          field
          message
        }
      }
    }`;
    const variables = { input: data };
    const response = await this.ShopifyService.executeGraphQL(query, variables);
    if (response.data.customerCreate && response.data.customerCreate.customer) {
      return response.data.customerCreate.customer;
    } else {
      throw new InternalServerErrorException('Failed to create customer on Shopify');
    }
  }
}
