import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';
import { DatabaseService } from 'src/database/database.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  generateLinkWithUTM,
  getFromDate,
  getWhatsappConfig,
  isTemplateButtonRedirectSafe,
  sanitizePhoneNumber,
} from 'utils/usefulfunction';
import { CustomersService } from 'src/customers/customers.service';
import { ChatsGateway } from 'src/chats/chats.gateway';
@Processor('broadcastQueue')
@Injectable()
export class BroadcastProcessor extends WorkerHost {
  constructor(
    private readonly whatsappService: WhatsappService,
    private readonly databaseService: DatabaseService,
    @InjectQueue('broadcastQueue') private readonly broadcastQueue: Queue,
    private readonly customersService: CustomersService,
    private readonly chatsGateway: ChatsGateway,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<void> {
    console.log('==== PROCESSING JOB ====');
    console.log('Job ID:', job.id);
    try {
      const { id } = job.data;
      console.log('Job Data:', job.data);

      // Update broadcast status to running
      const broadcast = await this.databaseService.broadcast.update({
        where: { id },
        data: { status: 'running' },
        include: { creator: true, createdFor: true },
      });
      console.log(
        'Broadcast updated:',
        broadcast.id,
        'Status:',
        broadcast.status,
      );

      const config = getWhatsappConfig(broadcast.createdFor);

      const response = await this.whatsappService.findSpecificTemplate(
        config,
        broadcast.template_name,
      );

      const template = response?.data?.[0];
      console.log('--- Template Response ---');
      console.log(JSON.stringify(template, null, 2));

      if (!template) {
        console.error('❌ Template not found');
        return;
      }

      // Retrieve contacts based on contacts type
      let data: any;
      if (broadcast.contacts_type === 'shopify' && broadcast.segment_id) {
        console.log(
          'Fetching Shopify contacts for segment:',
          broadcast.segment_id,
        );
        data = await this.customersService.getAllContactsForSegment(
          broadcast.segment_id,
          broadcast.creator,
        );
      } else if (broadcast.contacts_type === 'excel' && broadcast.excelData) {
        console.log('Processing Excel data.');
        const exceldata: any = broadcast.excelData;
        data = exceldata.data.map((item) => ({
          ...item,
          phone: item[exceldata.selectedField],
        }));
      } else {
        console.error('Invalid contacts type');
        throw new Error('Invalid contacts type');
      }
      console.log('Total contacts:', data.length);
      console.log();

      // Process each contact
      for (const broadcastData of data) {
        let trackurl: string;
        let trackId: string;
        console.log('===================================');
        console.log(broadcastData.phone);
        if (!broadcastData.phone) {
          return;
        }
        const contact = sanitizePhoneNumber(broadcastData.phone);
        console.log('Processing contact:', contact);

        // Build components for the template message
        const components = [];
        const { header, buttons, body } = broadcast.componentData as any;
        console.log('Component Data:', { header, buttons, body });

        // Process header component
        if (header && header.isEditable) {
          let headerValue = '';
          if (header.type === 'TEXT') {
            headerValue = header.fromsegment
              ? broadcastData[header.segmentname] || header.segmentAltValue
              : header.value;
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
              parameters: [
                { type: 'document', document: { link: header.value } },
              ],
            });
          }
          console.log('Header processed with value:', headerValue);
        }

        // Process body component parameters
        const bodyParameters = body.map((param) => {
          const value = param.fromsegment
            ? broadcastData[param.segmentname] ||
              param.segmentAltValue ||
              'test'
            : param.value || 'test';
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

        const islinkTrackEnabled = isTemplateButtonRedirectSafe(template);
        for (const [index, button] of buttons.entries()) {
          console.log(`Button [${index}]:`, button);

          if (button.type === 'URL' && button.isEditable) {
            if (!islinkTrackEnabled) {
              trackurl = button.value;
              if (broadcast.utm_campaign) {
                trackurl += `?utm_campaign=${broadcast.utm_campaign}`;
              }

              // Only append utm_source if enabled
              if (button.utm_source) {
                trackurl += trackurl.includes('?')
                  ? `&utm_source=${broadcast.utm_source}`
                  : `?utm_source=${broadcast.utm_source}`;
              }

              // Only append utm_medium if enabled
              if (broadcast.utm_medium) {
                trackurl += trackurl.includes('?')
                  ? `&utm_medium=${broadcast.utm_medium}`
                  : `?utm_medium=${broadcast.utm_medium}`;
              }
              if (broadcast.utm_id) {
                trackurl += trackurl.includes('?')
                  ? `&utm_id=${broadcast.id}`
                  : `?utm_id=${broadcast.id}`;
              }
              components.push({
                type: 'button',
                sub_type: 'url',
                index,
                parameters: [{ type: 'text', text: trackurl }],
              });
            } else {
              const url = await this.databaseService.linkTrack.create({
                data: {
                  link: button.value,
                  buisness_id: broadcast.createdFor.id,
                  broadcast_id: broadcast.id,
                  utm_campaign: broadcast.utm_campaign,
                  utm_source: broadcast.utm_source,
                  utm_id: broadcast.utm_id ? broadcast.id : null,
                },
              });
              console.log(url);
              trackId = url.id;
              trackurl = `go/${trackId}}`;
              components.push({
                type: 'button',
                sub_type: 'url',
                index,
                parameters: [{ type: 'text', text: trackurl }], // maybe use url instead of button.value?
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

        console.log('Buttons processed:', buttons);

        // Retrieve or create prospect for the contact
        let prospect = await this.databaseService.prospect.findUnique({
          where: {
            buisnessNo_phoneNo: {
              phoneNo: contact,
              buisnessNo: broadcast.createdFor.whatsapp_mobile,
            },
          },
        });

        console.log('Prospect:', prospect ? prospect.id : 'Not found');
        let uniqueContact = false;
        if (!prospect) {
          const iflinkedToShopify =
            await this.customersService.getCustomerByPhone(
              `+${contact}`,
              broadcast.creator,
            );
          uniqueContact = true;
          console.log('Unique contact:', iflinkedToShopify);

          prospect = await this.databaseService.prospect.create({
            data: {
              phoneNo: contact,
              buisnessNo: broadcast.createdFor.whatsapp_mobile,
              shopify_id: iflinkedToShopify?.id.replace(/^\D+/g, ''),
              name: iflinkedToShopify?.displayName,
              email: iflinkedToShopify?.email,
            },
          });
          console.log('New prospect created:', prospect.id);
        }

        // Process footer and body raw text replacement
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
            acc[param.parameter_name] = param.fromsegment
              ? broadcastData[param.segmentname] || param.segmentAltValue
              : param.value;
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

        // Save chat record to the database
        const updatedButtons = buttons.map((button) => {
          if (button.type === 'URL' && button.isEditable === true) {
            const findButtonfromtemplate = template.components.find(
              (component) => component.type === 'BUTTONS',
            );
            if (findButtonfromtemplate) {
              const templateUrlButton = findButtonfromtemplate.buttons.find(
                (btn) => btn.type === 'URL',
              );
              if (templateUrlButton && templateUrlButton.url) {
                console.log('Original template URL:', templateUrlButton.url);
                const placeholder = '{{1}}';
                const finalUrl = templateUrlButton.url
                  .split(placeholder)
                  .join(trackurl);
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
        console.log('Creating chat record in DB for contact:', contact);
        const addTodb = await this.databaseService.chat.create({
          data: {
            prospectId: prospect.id,
            template_used: true,
            template_name: broadcast.template_name,
            senderPhoneNo: broadcast.createdFor.whatsapp_mobile,
            receiverPhoneNo: contact,
            sendDate: new Date(),
            header_type: header?.type,
            header_value:
              header?.isEditable && header?.type === 'TEXT'
                ? broadcastData[header.segmentname] || header.segmentAltValue
                : header?.value,
            body_text: bodyRawText,
            footer_included: footer ? true : false,
            footer_text: footer?.text || '',
            Buttons: updatedButtons,
            type: template.type || 'text',
            template_components: components,
            isForBroadcast: true,
            broadcastId: broadcast.id,
            isAutomated: true,
          },
        });
        console.log('Chat record created:', addTodb);
        console.log('Message processed successfully for contact:', contact);

        // Dead Audience Filtering check (post sending)
        if (
          broadcast.skip_inactive_contacts_enabled &&
          broadcast.skip_inactive_contacts_days > 0 &&
          prospect &&
          !uniqueContact
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
                  senderPhoneNo: broadcast.createdFor.whatsapp_mobile,
                  createdAt: { gte: fromDate },
                  Status: 'read',
                },
                {
                  receiverPhoneNo: broadcast.createdFor.whatsapp_mobile,
                  senderPhoneNo: contact,
                  createdAt: { gte: fromDate },
                },
              ],
            },
          });
          if (findMessage.length === 0) {
            console.log(`Skipping ${contact} due to Dead Audience Filtering.`);
            await this.databaseService.chat.update({
              where: { id: addTodb.id },
              data: {
                Status: 'skipped',
                failedReason: 'Skipped due to Dead Audience Filtering.',
              },
            });
            continue;
          }
        }

        // Marketing Messages Frequency Control check (post sending)
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
              senderPhoneNo: broadcast.createdFor.whatsapp_mobile,
              receiverPhoneNo: contact,
              createdAt: { gte: getDate },
            },
          });
          if (
            checkMessage.length >=
            broadcast.limit_marketing_message_messagenumber
          ) {
            console.log(
              `Skipping ${contact} due to Marketing Messages Frequency Control.`,
            );
            await this.databaseService.chat.update({
              where: { id: addTodb.id },
              data: {
                Status: 'skipped',
                failedReason:
                  'Skipped due to Marketing Messages Frequency Control.',
              },
            });
            continue;
          }
        }

        console.log(
          'Sending message to:',
          contact,
          'with components:',
          components,
        );
        try {
          const messageResponse =
            await this.whatsappService.sendTemplateMessage(
              {
                recipientNo: contact,
                templateName: template.name,
                languageCode: template.language,
                components,
              },
              config,
            );

          console.log('Message sent successfully:', messageResponse);
          if (messageResponse?.messages?.[0]?.id) {
            const message = await this.databaseService.chat.update({
              where: { id: addTodb.id },
              data: {
                Status: 'pending',
                chatId: messageResponse.messages[0].id,
              },
            });
            this.chatsGateway.sendMessageToSubscribedClients(
              broadcast.createdFor.id,
              'prospect',
              prospect,
            );

            this.chatsGateway.sendMessageToSubscribedClients(
              broadcast.createdFor.id,
              'messages',
              message,
            );
          } else {
            await this.databaseService.chat.update({
              where: { id: addTodb.id },
              data: {
                Status: 'failed',
                failedReason: 'failed due to unknown reason',
              },
            });
          }
        } catch (error: any) {
          // Capture detailed error info, using error.response.data if available
          const errorDetail = error.message;

          console.error('Error sending message:', errorDetail);

          await this.databaseService.chat.update({
            where: { id: addTodb.id },
            data: { Status: 'failed', failedReason: errorDetail },
          });
        }
        if (trackId && islinkTrackEnabled) {
          await this.databaseService.linkTrack.update({
            where: { id: trackId },
            data: {
              chat_id: addTodb.id,
            },
          });
        }
        // Update chat record with message details
      }
      await this.databaseService.broadcast.update({
        where: { id: broadcast.id },
        data: {
          status: 'completed',
        },
      });

      console.log('==== JOB PROCESSING COMPLETE ====');
    } catch (error) {
      console.error('Error in BroadcastProcessor:', error);
    }
  }
}

// Helper function to escape regex special characters
function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
