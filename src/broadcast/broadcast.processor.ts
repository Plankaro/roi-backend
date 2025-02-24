import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';
import { DatabaseService } from 'src/database/database.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { getFromDate, getWhatsappConfig, sanitizePhoneNumber } from 'utils/usefulfunction';
import { CustomersService } from 'src/customers/customers.service';

@Processor('broadcastQueue')
@Injectable()
export class BroadcastProcessor extends WorkerHost {
  constructor(
    private readonly whatsappService: WhatsappService,
    private readonly databaseService: DatabaseService,
    @InjectQueue('broadcastQueue') private readonly broadcastQueue: Queue,
    private readonly customersService: CustomersService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<void> {
    try {
      const {
        // recipients, // Array of recipient numbers
        // templateName,
        // templatetype,
        // languageCode,
        // components,
        // previewSection,
        // broadastContactId,
        // DeadAudienceFilteringEnabled,
        // DeadAudienceFilteringTiming,
        // MarketingmessagesfreqControlEnabled,
        // MarketingmessageLimit,
        // MarketingmessageLimitTiming,
        // SkipDuplicates,
        // config
        id,
        template,
      } = job.data;

      console.log(job.data);
      const broadcast = await this.databaseService.broadcast.update({
        where: {
          id: id,
        },
        data: {
          status: 'running',
        },
        include: {
          creator: {
            include: {
              business: true,
            },
          },
        },
      });
      console.log(broadcast);

      let data: any;

      if (broadcast.contacts_type === 'shopify' && broadcast.segment_id) {
        console.log('hitting');
        console.log(broadcast.segment_id);
        const shopify: any =
          await this.customersService.getAllContactsForSegment(
            broadcast.segment_id,
            broadcast.creator,
          );
        console.log(shopify);
        data = shopify;
      } else if (broadcast.contacts_type === 'excel' && broadcast.excelData) {
        const exceldata: any = broadcast.excelData;
        data = exceldata.data.map((item) => ({
          ...item,
          phone: item[exceldata.selectedField],
        }));
      } else {
        throw new Error('Invalid contacts type');
      }

      console.log(data);

      for (const broadcastData of data) {
        let contact = sanitizePhoneNumber(`${broadcastData.phone}`);
        let prospect;
        prospect = await this.databaseService.prospect.findUnique({
          where: {
            phoneNo: contact,
          },
        });

        //logic for dead filters
        if (
          broadcast.skip_inactive_contacts_enabled &&
          broadcast.skip_inactive_contacts_days > 0 &&
          prospect
        ) {
          const fromDate = new Date(
            Date.now() -
              broadcast.skip_inactive_contacts_days * 24 * 60 * 60 * 1000,
          );
          const findMessage = await this.databaseService.chat.findMany({
            where: {
              OR: [
                {
                  receiverPhoneNo: contact,
                  senderPhoneNo: broadcast.creator.business.whatsapp_mobile,
                  createdAt: { gte: fromDate },
                  Status: 'read',
                },
                {
                  receiverPhoneNo: broadcast.creator.business.whatsapp_mobile,
                  senderPhoneNo: contact,
                  createdAt: { gte: fromDate },
                },
              ],
            },
          });
          if (findMessage.length === 0) {
            console.log(
              `Skipping recipient ${contact} due to Dead Audience Filtering.`,
            );
            continue;
          }
        }
        if (!prospect) {
          prospect = await this.databaseService.prospect.create({
            data: {
              phoneNo: contact,
              buisnessNo: broadcast.creator.business.whatsapp_mobile,
            },
          });
        }

        // logic for marketing messages frequency control
        if (
          broadcast.limit_marketing_message_enabled &&
          broadcast.limit_marketing_message_messagenumber > 0 &&
          broadcast.limit_marketing_message_duration
        ) {
          const getDate = getFromDate(
            broadcast.limit_marketing_message_duration,
          );
          const checkMessage = await this.databaseService.chat.findMany({
            where: {
              senderPhoneNo: broadcast.creator.business.whatsapp_mobile,
              receiverPhoneNo: contact,
              createdAt: {
                gte: getDate,
              },
            },
          });
          if (
            checkMessage.length >=
            broadcast.limit_marketing_message_messagenumber
          ) {
            console.log(
              `Skipping recipient ${contact} due to Marketing Messages Frequency Control.`,
            );
            continue;
          }

          // logic for components
        }

        const components = [];

        const { header, buttons, body } = broadcast.componentData as any;

        if (header && header.isEditable) {
          if (header.type === 'TEXT') {
            let value;
            if (header.fromsegment) {
              value =
                broadcastData[header.segmentname] || header.segmentAltValue;
            } else {
              value = header.value;
            }

            if (
              template.parameter_format === 'NAMED' &&
              template.components[0].example.header_text_named_params[0]
                .param_name
            ) {
              components.push({
                type: 'header',
                parameters: [
                  {
                    type: 'text',
                    parameter_name:
                      template.components[0].example.header_text_named_params[0]
                        .param_name,
                    text: value,
                  },
                ],
              });
            } else {
              components.push({
                type: 'header',
                parameters: [{ type: 'text', text: value }],
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
              parameters: [
                { type: 'document', document: { link: header.value } },
              ],
            });
          }
        }

        const bodyParameters = body.map((param) => {
          const value = param.fromsegment
            ? broadcastData[param.segmentname] || param.segmentAltValue
            : param.value;

          template.parameter_format === 'NAMED'
            ? {
                type: 'text',
                parameter_name: param.parameter_name,
                text: value,
              }
            : { type: 'text', text: param.value };
        });
        components.push({ type: 'body', parameters: bodyParameters });
        buttons.forEach((button, index) => {
          if (button.type === 'URL' && button.isEditable === true) {
            components.push({
              type: 'button',
              sub_type: 'url',
              index: '0',
              parameters: [{ type: 'text', text: button.value }],
            });
          } else if (button.type === 'COPY_CODE') {
            components.push({
              type: 'button',
              sub_type: 'copy_code',
              index: index,
              parameters: [{ type: 'otp', text: encodeURI(button.value) }],
            });
          }
        });

        const config = getWhatsappConfig(broadcast.creator.business)

        const response: any = await this.whatsappService.sendTemplateMessage({
          recipientNo:contact,
                  templateName:template.name,
                  languageCode:template.language,
                  components,
                },
              config
            );

            console.log(response);


      }

      
    

   
    } catch (error) {
      console.log(error);
    }
  }
}
