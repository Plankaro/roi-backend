import { WorkerHost, Processor } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { getShopifyConfig, sanitizePhoneNumber } from 'utils/usefulfunction';
import { ChatsGateway } from '../chats.gateway';
import { ShopifyService } from 'src/shopify/shopify.service';
import { GemniService } from 'src/gemni/gemni.service';

@Processor('receiveChatsQueue')
@Injectable()
export class ReceiveChatsQueue extends WorkerHost {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly shopifyService: ShopifyService,
    private readonly chatsGateway: ChatsGateway,
    private readonly gemniService: GemniService,
    @InjectQueue('bottransferQueue') private readonly bottransferQueue: Queue,
  ) {
    super();
  }
  async process(job: Job) {
    const { receiveMessageDto } = job.data;
    try {
  

      const { entry } = receiveMessageDto;
      const processedResults = [];

      for (const individualEntry of entry) {
    

        for (const change of individualEntry.changes) {
        
          const { value } = change;

          const businessPhoneNumber = sanitizePhoneNumber(
            value.metadata.display_phone_number,
          );
          

          const business = await this.databaseService.business.findUnique({
            where: { whatsapp_mobile: businessPhoneNumber },
          });

          if (!business) {
            console.warn(
              `Business not found for phone number: ${businessPhoneNumber}`,
            );
            return;
          }

          if (value.messages) {
          

            const messagePromises = value.messages.map(async (message) => {
              try {
                const rawPhoneNumber = `+${sanitizePhoneNumber(message.from)}`;
              

                const findBuisness =
                  await this.databaseService.business.findUnique({
                    where: {
                      whatsapp_mobile: businessPhoneNumber,
                    },
                  });
                const config = getShopifyConfig(findBuisness);
                const customer = await this.getCustomerByIdentifier(
                  rawPhoneNumber,
                  config,
                );

               
                const prospect = await this.databaseService.prospect.upsert({
                  where: {
                    buisnessNo_phoneNo: {
                      phoneNo: sanitizePhoneNumber(message.from),
                      buisnessNo: businessPhoneNumber,
                    },
                  },
                  update: { last_Online: new Date() },
                  create: {
                    phoneNo: sanitizePhoneNumber(message.from),
                    buisnessNo: businessPhoneNumber,
                    lead: 'LEAD',
                    last_Online: new Date(),
                    name: customer.displayName,

                    email: customer.email,
                  },
                  include: {
                    chats: {
                      orderBy: { createdAt: 'desc' },
                      take: 1,
                    },
                  },
                });

                this.chatsGateway.sendMessageToSubscribedClients(
                  businessPhoneNumber,
                  'prospect',
                  prospect,
                );

                // Check if last chat was a broadcast
                if (prospect.chats.length > 0) {
                  const lastChat = prospect.chats[0];

                  if (
                    lastChat.isForBroadcast === true &&
                    lastChat.broadcastId
                  ) {
                   

                    await this.databaseService.broadcast.update({
                      where: { id: lastChat.broadcastId },
                      data: { reply_count: { increment: 1 } },
                    });
                  }
                }

                const chatMessage = await this.databaseService.chat.create({
                  data: {
                    prospectId: prospect.id,
                    chatId: message.id,
                    senderPhoneNo: message.from,
                    receiverPhoneNo: businessPhoneNumber,
                    sendDate: new Date(),
                    body_text: message.text?.body,
                    Status: 'delivered',
                    type: 'personal',
                  },
                });

                const gemniResponse =
                  await this.gemniService.generateEnumValues(
                    chatMessage.body_text,
                  );
                console.log(gemniResponse);

                await this.bottransferQueue.add(
                  'bottransfer',
                  {
                    chatMessageId:chatMessage.id,
                    gemniResponse,
                    isFirstMessage: prospect.chats.length === 0,
                  },
                  { delay: 0, removeOnComplete: true },
                );

                console.log(`Chat saved to DB: ${JSON.stringify(chatMessage)}`);
                processedResults.push(chatMessage);

                this.chatsGateway.sendMessageToSubscribedClients(
                  businessPhoneNumber,
                  'messages',
                  chatMessage,
                );
              } catch (error) {
                console.error('Error processing message:', error);
              }
            });

            await Promise.allSettled(messagePromises);
          }

          if (value.statuses) {
        

            const statusPromises = value.statuses.map(async (status) => {
              try {
              
                const findChat = await this.databaseService.chat.findUnique({
                  where: { chatId: status.id },
                })
                if (!findChat) {
                  console.warn(`Chat not found for status: ${status.id}`);
                  return;
                }
                const updatedChat = await this.databaseService.chat.update({
                  where: { chatId: status.id },
                  data: {
                    Status: status.status,
                    failedReason: status.errors?.[0]?.message ?? null,
                  },
                });
                if (
                  updatedChat.isForBroadcast === true &&
                  updatedChat.broadcastId &&
                  updatedChat.Status === 'read'
                ) {
                  await this.databaseService.broadcast.update({
                    where: { id: updatedChat.broadcastId },
                    data: { unique_interactions: { increment: 1 } },
                  });
                }

                processedResults.push(updatedChat);

                this.chatsGateway.sendMessageToSubscribedClients(
                  businessPhoneNumber,
                  'messages',
                  updatedChat,
                );
              } catch (error) {
                console.error('Error updating status:', error);
              }
            });

            await Promise.allSettled(statusPromises);
          }
        }
      }

   
      return { success: true, processed: processedResults.length };
    } catch (error) {
      console.error('Error in receiveMessage:', error);
      throw new InternalServerErrorException(
        error || 'Failed to process messages from Shopify',
      );
    }
  }
  async getCustomerByIdentifier(phoneNumber, config) {
    // GraphQL query with a variable for the phone number.
    const query = `
      query CustomerByIdentifier($phoneNumber: String!) {
        customerByIdentifier(identifier: {phoneNumber: $phoneNumber}) {
          displayName
          email
          id
        }
      }
    `;

    // Define the variables to be used in the query.
    const variables = { phoneNumber };

    const result = await this.shopifyService.executeGraphQL(
      query,
      variables,
      config,
    );
    return result.data?.customerByIdentifier;
  }

  
}
