import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';
import { DatabaseService } from 'src/database/database.service';
import { getWhatsappConfig } from 'utils/usefulfunction';
import { Chat } from '@prisma/client';

@Processor('broadcastRetryQueue')
@Injectable()
export class BroadcastRetryProcessor extends WorkerHost {
  constructor(
    private readonly whatsappService: WhatsappService,
    private readonly databaseService: DatabaseService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<void> {
    try {
      const { broadcastId, retryId } = job.data;
      console.log({ broadcastId, retryId });

      // Retrieve the broadcast with its creator (including business) and all retries (ordered descending).
      const broadcast = await this.databaseService.broadcast.findUnique({
        where: { id: broadcastId },
        include: {
          creator: { include: { business: true } },
          retry: { orderBy: { created_at: 'desc' } },
        },
      });

      if (!broadcast) {
        throw new InternalServerErrorException('Broadcast not found');
      }

      // Determine the latest retry, if one exists.
      const latestRetry =
        broadcast.retry.length > 1 ? broadcast.retry[1] : null;
      let failedChats: Chat[];

      if (!latestRetry) {
        // If no retry exists, use all failed chats from the initial broadcast.
        failedChats = await this.databaseService.chat.findMany({
          where: { broadcastId: broadcast.id, Status: 'failed' },
        });
      } else {
        // Otherwise, use only the chats that failed during the latest retry.
        failedChats = await this.databaseService.chat.findMany({
          where: {
            broadcastId: broadcast.id,
            Status: 'failed',
            retryId: latestRetry.id,
          },
        });
      }
      console.log('Failed Chats:', failedChats);

      if (failedChats.length === 0) {
        console.log('No failed chats to process.');
        
      }

      const config = getWhatsappConfig(broadcast.creator.business);

      // Process each failed chat: create a new retry chat record, send the WhatsApp message, then update the chat.
      const sendResults = await Promise.all(
        failedChats.map(async (failedChat) => {
          // Create a new chat record for the retry attempt.
          const newChat = await this.databaseService.chat.create({
            data: {
             // Adjust as needed (if prospectId should come from a different field)
              template_used: true,
              template_name: failedChat.template_name,
              senderPhoneNo: failedChat.senderPhoneNo,
              receiverPhoneNo: failedChat.receiverPhoneNo,
              sendDate: new Date(),
              header_type: failedChat.header_type,
              header_value: failedChat.header_value,
              body_text: failedChat.body_text,
              footer_included: failedChat.footer_included,
              footer_text: failedChat.footer_text,
              Buttons: failedChat.Buttons,
              type: failedChat.type,
              template_components: failedChat.template_components,
              isForBroadcast: true,
              broadcastId: broadcast.id,
              isForRetry: true,
              retryId: retryId, // Use the retryId provided in the job payload
            },
          });

          try {
            // Send the WhatsApp message using the new chat's details.
            const message = await this.whatsappService.sendTemplateMessage(
              {
                recipientNo: newChat.receiverPhoneNo,
                templateName: broadcast.template_name,
                languageCode: broadcast.template_language,
                components: newChat.template_components,
              },
              config,
            );
            // On success, update the new chat record with a "sent" status.
            if (message?.messages?.[0]?.id) {
              await this.databaseService.chat.update({
                where: { id: newChat.id },
                data: {
                  Status: 'pending',
                  chatId: message.messages[0].id,
                },
              });
            } else {
              await this.databaseService.chat.update({
                where: { id: newChat.id },
                data: { Status: 'failed',failedReason:"failed due to unknown reason" },
                
              });
            }
          }  catch (error: any) {
            // Capture detailed error info, using error.response.data if available
            const errorDetail =
              error.message
  
            console.error('Error sending message:', errorDetail);
  
            await this.databaseService.chat.update({
              where: { id: newChat.id },
              data: { Status: 'failed', failedReason: errorDetail },
            });
          }
        }),
      );
      await this.databaseService.retry.update({
        where: { id: retryId },
        data: {
          status:"completed"
        },
      })

      const totalMessages = sendResults.filter(
        (result) => result !== null,
      ).length;
      console.log(`Total messages sent: ${totalMessages}`);
      console.log('Job completed successfully.');
      
    } catch (error: any) {
      console.error('Error in BroadcastRetryProcessor:', error.message);
      throw new InternalServerErrorException(error.message);
    }
  }
}
