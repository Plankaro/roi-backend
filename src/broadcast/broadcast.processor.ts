import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';
import { DatabaseService } from 'src/database/database.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { sanitizePhoneNumber } from 'utils/usefulfunction';

@Processor('broadcastQueue')
@Injectable()
export class BroadcastProcessor extends WorkerHost {
  constructor(
    private readonly whatsappService: WhatsappService,
    private readonly databaseService: DatabaseService,
    @InjectQueue('broadcastQueue') private readonly broadcastQueue: Queue,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<void> {
    const {
      recipients, // Array of recipient numbers
      templateName,
      templatetype,
      languageCode,
      components,
      previewSection,
      broadastContactId,
      DeadAudienceFilteringEnabled,
      DeadAudienceFilteringTiming,
      MarketingmessagesfreqControlEnabled,
      MarketingmessageLimit,
      MarketingmessageLimitTiming,
      SkipDuplicates,
    } = job.data;

    console.log(`Processing job for recipients: ${JSON.stringify(recipients)}`);
    this.databaseService.broadcast.update({
      where: {
        id: broadastContactId,
      },
      data: {
        status: 'running',
      },
    })

    const unsentRecipients: string[] = [];
    let uniqueRecipients = recipients;
    if (SkipDuplicates) {
      const recipientSet = new Set(recipients);
      uniqueRecipients = Array.from(recipientSet); // Remove duplicates
      console.log(`Filtered unique recipients: ${JSON.stringify(uniqueRecipients)}`);
    }
  
    for (let i = 0; i < uniqueRecipients.length; i++) {
      const recipientNo = recipients[i];
      const timeLimitInSeconds = DeadAudienceFilteringTiming; // e.g., 3600 (1 hour), 7200 (2 hours).
      const timeLimit = new Date(Date.now() - timeLimitInSeconds * 1000);
      if (DeadAudienceFilteringEnabled && DeadAudienceFilteringTiming) {
        const findMessage = await this.databaseService.chat.findMany({
          where: {
            OR: [
              {
                receiverPhoneNo: recipientNo,
                senderPhoneNo: '15551365364',
                createdAt: timeLimit,
              },
              {
                receiverPhoneNo: '15551365364',
                senderPhoneNo: recipientNo,
                createdAt: timeLimit,
              },
            ],
          },
        });

        if (findMessage.length > 0) {
          console.log(
            `Skipping recipient ${recipientNo} due to Dead Audience Filtering.`,
          );
          continue;
        }
      }

      if (
        MarketingmessagesfreqControlEnabled &&
        MarketingmessageLimit &&
        MarketingmessageLimitTiming
      ) {
        const findMessage = await this.databaseService.chat.findMany({
          where: {
            OR: [
              {
                receiverPhoneNo: recipientNo,
                senderPhoneNo: '15551365364',
                type: 'marketing',
                createdAt: {
                  gte: new Date(
                    Date.now() - MarketingmessageLimitTiming * 1000,
                  ),
                },
              },
            ],
          },
        });

        if (findMessage.length >= MarketingmessageLimit) {
          console.log(
            `Skipping recipient ${recipientNo} due to Marketing messages frequency control.`,
          );
          continue;
        }
      }
     

      try {
        // Attempt to send the WhatsApp message.
        const response: any = await this.whatsappService.sendTemplateMessage({
          recipientNo,
          templateName,
          languageCode,
          components,
        });
       
      const isprospectrelated = await this.databaseService.prospect.findUnique({
        where:{
          buisnessNo_phoneNo:{
            phoneNo: sanitizePhoneNumber(response?.contacts[0].input.replace(/^\+/, '')),
            buisnessNo: '15551365364',
          }
        }
      })

        // Save the successful send in the database.
        const chat = await this.databaseService.chat.create({
          data: {
         prospectId:isprospectrelated.id,
            chatId: response?.messages[0]?.id ?? '',
            template_used: true,
            template_name: templateName,
            senderPhoneNo: '15551365364',
            receiverPhoneNo: response?.contacts[0].input.replace(/^\+/, ''),
            sendDate: new Date(),
            header_type: previewSection.header.type,
            header_value: previewSection.header.value,
            body_text: previewSection.bodyText,
            footer_included: previewSection.footer.length > 0,
            footer_text: previewSection.footer,
            Buttons: previewSection.buttons,
            isForBroadcast: true,
            broadcastId: broadastContactId,
            Status: 'pending',
            type: templatetype || 'personal',
          },
        });
        await this.databaseService.contacts.create({
          data:{
            phoneNo:sanitizePhoneNumber(recipientNo),
            BroadCastId:broadastContactId,
            chatId:chat.id

          }
        })
      } catch (error) {
        console.log(JSON.stringify(error,null,2));
        // If a rate limit error occurs, capture the remaining recipients.
        if (error.response && error.response.status === 429) {
          console.error(
            `Rate limit hit for ${recipientNo}. Capturing unsent recipients from index ${i}.`,
          );
          unsentRecipients.push(...recipients.slice(i));
          break;
        } else {
          console.error(
            `Error sending message to ${recipientNo}:`,
            error?.response?.data || error.message,
          );
          // Optionally, you could log the failure or decide to skip this recipient.
        }
      }

      // Introduce a delay between sends to further reduce risk of rate limiting.
      await new Promise((resolve) => setTimeout(resolve, 100));
    }


    // If there are unsent recipients due to rate limiting, requeue them for a retry after 24 hours.
    if (unsentRecipients.length > 0) {
      console.log(
        `Requeuing unsent recipients: ${JSON.stringify(unsentRecipients)}`,
      );
      await this.broadcastQueue.add(
        'sendBroadcast',
        {
          broadastContactId,
          recipients: unsentRecipients,
          templateName,
          languageCode,
          components,
          previewSection,
        },
        {
          delay: 24 * 60 * 60 * 1000, // 24 hours delay
          attempts: 1,
        },
      );
    }else{
      this.databaseService.broadcast.update({
        where: {
          id: broadastContactId,
        },
        data: {
          status: 'completed',
        },
      })
    }
  }
}
