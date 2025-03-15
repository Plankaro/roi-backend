import { WorkerHost, Processor } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { sanitizePhoneNumber } from 'utils/usefulfunction';
import { ChatsGateway } from '../chats.gateway';

@Processor('receiveChatsQueue')
@Injectable()
export class ReceiveChatsQueue extends WorkerHost {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly chatsGateway: ChatsGateway,
  ) {
    super();
  }
  async process(job: Job) {
    const { receiveMessageDto } = job.data;
    try {
      console.log(
        'Received payload:',
        JSON.stringify(receiveMessageDto, null, 2),
      );

      const { entry } = receiveMessageDto;
      const processedResults = [];

      for (const individualEntry of entry) {
        console.log(`Processing entry: ${JSON.stringify(individualEntry)}`);

        for (const change of individualEntry.changes) {
          console.log(`Processing change: ${JSON.stringify(change)}`);
          const { value } = change;

          const businessPhoneNumber = sanitizePhoneNumber(
            value.metadata.display_phone_number,
          );
          console.log(
            `Sanitized Business Phone Number: ${businessPhoneNumber}`,
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
            console.log('Processing messages...');

            const messagePromises = value.messages.map(async (message) => {
              try {
                const rawPhoneNumber = `+${sanitizePhoneNumber(message.from)}`;
                console.log(`Processing message from: ${rawPhoneNumber}`);
                console.log(`Message content: ${JSON.stringify(message)}`);

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
                  },
                  include: {
                    chats: {
                      orderBy: { createdAt: 'desc' },
                      take: 1,
                    },
                  },
                });

                console.log(`Prospect details: ${JSON.stringify(prospect)}`);

                this.chatsGateway.sendMessageToSubscribedClients(
                  businessPhoneNumber,
                  'prospect',
                  prospect,
                );

                // Check if last chat was a broadcast
                if (prospect.chats.length > 0) {
                  const lastChat = prospect.chats[0];
                  console.log(`Last chat details: ${JSON.stringify(lastChat)}`);

                  if (
                    lastChat.isForBroadcast === true &&
                    lastChat.broadcastId
                  ) {
                    console.log(
                      `Incrementing reply count for broadcast: ${lastChat.broadcastId}`,
                    );

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
            console.log('Processing message statuses...');

            const statusPromises = value.statuses.map(async (status) => {
              try {
                console.log(
                  `Processing status update: ${JSON.stringify(status)}`,
                );

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

                console.log(
                  `Updated chat status in DB: ${JSON.stringify(updatedChat)}`,
                );
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

      console.log(
        `Processing completed. Total processed items: ${processedResults.length}`,
      );
      return { success: true, processed: processedResults.length };
    } catch (error) {
      console.error('Error in receiveMessage:', error);
      throw new InternalServerErrorException(
        error || 'Failed to process messages from Shopify',
      );
    }
  }
}
