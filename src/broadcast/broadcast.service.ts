import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { delay, Queue } from 'bullmq';
import { DatabaseService } from 'src/database/database.service';
import {
  calculateDelay,
  getWhatsappConfig,
  mergeDateTime,
  sanitizePhoneNumber,
} from 'utils/usefulfunction';
import { CreateBroadcastDto } from './dto/create-broadcast.dto';
import { Broadcast, Chat } from '@prisma/client';
import { format } from 'date-fns';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';

@Injectable()
export class BroadcastService {
  constructor(
    @InjectQueue('broadcastQueue') private readonly broadcastQueue: Queue,
    @InjectQueue('broadcastRetryQueue') private readonly broadcastRetryQueue: Queue,
    private readonly databaseService: DatabaseService,
    private readonly whatsappService: WhatsappService,
  ) {}

  async create(createBroadcastDto: any, req: any): Promise<Broadcast> {
    const {
      name,
      type,
      templateForm,
      contact,
      utmParameters,
      advanceFilters,
      onlimitexced,
      schedule,
      template,
     
    } = createBroadcastDto;
    const user = req.user;
    const broadcastData: any = {
      name,
      type,
      description: '',
      componentData: templateForm,
      ...(utmParameters.utm_campaign.enabled && {
        utm_campaign: utmParameters.utm_campaign.value,
      }),
      ...(utmParameters.utm_source.enabled && {
        utm_source: utmParameters.utm_source.value,
      }),
      ...(utmParameters.utm_medium.enabled && {
        utm_medium: utmParameters.utm_medium.value,
      }),
      utm_term: utmParameters.utm_term,
      utm_id: utmParameters.utm_id,
      avoid_duplicate: advanceFilters.avoidDuplicateContacts.enabled,
      skip_inactive_contacts_enabled:
        advanceFilters.skipInactiveContacts.enabled,
      limit_marketing_message_enabled:
        advanceFilters.limitMarketingMessages.enabled,
      template_name: template.name,
      template_language: template.language,
      onlimit_exced: onlimitexced,
      price: `5000`,
      createdBy: user.id,
      createdForId: user.business.id,
      total_contact:contact.total_count
      ,
    };

    if (contact.type === 'shopify') {
      (broadcastData.contacts_type = 'shopify'),
        (broadcastData.segment_id = contact.id.match(/\d+$/)?.[0]);
    }
    if (contact.type === 'excel') {
      (broadcastData.contacts_type = 'excel'),
        (broadcastData.excelData = {
          data: contact.data,
          selectedField: contact.selectedField,
        });
    }

    if (advanceFilters.skipInactiveContacts.enabled) {
      broadcastData.skip_inactive_contacts_days =
        advanceFilters.skipInactiveContacts.days;
    }

    if (advanceFilters.limitMarketingMessages.enabled) {
      broadcastData.limit_marketing_message_messagenumber =
        advanceFilters.limitMarketingMessages.maxMessages;
      broadcastData.limit_marketing_message_duration = `${advanceFilters.limitMarketingMessages.timeRange} ${advanceFilters.limitMarketingMessages.timeUnit}`;
    }
    let delay = 0;

    if (schedule) {
      const mergedDateTime = mergeDateTime(schedule.date, schedule.time);

      broadcastData.isScheduled = schedule.schedule;
      broadcastData.scheduledDate = mergedDateTime;
    }

    const createBroadcast = await this.databaseService.broadcast.create({
      data: {
        ...broadcastData,
      },
    });
    if (broadcastData.isScheduled) {
      delay = calculateDelay(createBroadcast.scheduledDate);
    }
    console.log(delay);

    await this.broadcastQueue.add(
      'sendBroadcast',
      { id: createBroadcast.id },
      { delay: delay, removeOnComplete: true },
    );

    return createBroadcast;
  }

  async sendTestMessage(testmessageDto: any, req: any) {
    const user = req.user;
    const config = getWhatsappConfig(user.business);

    const { template, templateForm, testphoneno } = testmessageDto;

    const { header, buttons, body } = templateForm as any;
    let components = [];
    if (header && header.isEditable) {
      if (header.type === 'TEXT') {
        let value;
        if (header.fromsegment) {
          value = header.segmentAltValue;
        } else {
          value = header.value;
        }

        if (
          template.parameter_format === 'NAMED' &&
          template.components[0].example.header_text_named_params[0].param_name
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
          parameters: [{ type: 'document', document: { link: header.value } }],
        });
      }
    }
    const bodyParameters = body.map((param) => {
      const value = param.fromsegment
        ? param.segmentAltValue || 'test'
        : param.value || 'test';

      return template.parameter_format === 'NAMED'
        ? {
            type: 'text',
            parameter_name: param.parameter_name.replace(/{{|}}/g, '') ,
            text: value,
          }
        : { type: 'text', text: value };
    });

    components.push({ type: 'body', parameters: bodyParameters });
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


    const message: any = await this.whatsappService.sendTemplateMessage(
      {
        recipientNo: sanitizePhoneNumber(testphoneno),
        templateName: template.name,
        languageCode: template.language,
        components,
      },
      config,
    );

    return message;
  }

  async getAllBroadcasts(req: any) {
    try {
      const business = req.user.business;

      // 1. Fetch all broadcasts for this business
      const broadcasts = await this.databaseService.broadcast.findMany({
        where: { createdForId: business.id },
        orderBy: { createdAt: 'desc' },
        include: {
          Order: true,
        },
      });

      // 2. For each broadcast, gather message statistics concurrently
      const results = await Promise.all(
        broadcasts.map(async (broadcast) => {
          const [
            totalMessages,
            deliveredCount,
            readCount,
            skippedCount,
            failedCount,
          ] = await Promise.all([
            this.databaseService.chat.count({
              where: { broadcastId: broadcast.id },
            }),
            this.databaseService.chat.count({
              where: {
                broadcastId: broadcast.id,
                Status: { in: ['delivered', 'read'] },
              },
            }),
            this.databaseService.chat.count({
              where: {
                broadcastId: broadcast.id,
                Status: 'read',
              },
            }),
            this.databaseService.chat.count({
              where: {
                broadcastId: broadcast.id,
                Status: 'skipped',
              },
            }),
            this.databaseService.chat.count({
              where: {
                broadcastId: broadcast.id,
                Status: 'failed',
              },
            }),
          ]);

          

          return {
            ...broadcast,
            totalMessages,
            deliveredCount,
            readCount,
            skippedCount,
            failedCount,
          };
        }),
      );

      return results;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getBroadcastById(id: string, req: any) {
    try {
      const business = req.user.business;

      // Fetch a single broadcast for this business
      const broadcast = await this.databaseService.broadcast.findUnique({
        where: {
          createdForId: business.id,
          id: id,
        },
        include: {
          Order: true,
          creator: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!broadcast) {
        throw new Error('Broadcast not found');
      }

      // Execute all queries concurrently
      const [
        totalMessages,
        deliveredCount,
        readCount,
        skippedCount,
        failedCount,
        skippedReasonGroups,
        failedReasonGroups,
        sentCount,
      ] = await Promise.all([
        this.databaseService.chat.count({
          where: { broadcastId: broadcast.id },
        }),
        this.databaseService.chat.count({
          where: {
            broadcastId: broadcast.id,
            Status: { in: ['delivered', 'read'] },
          },
        }),
        this.databaseService.chat.count({
          where: {
            broadcastId: broadcast.id,
            Status: 'read',
          },
        }),
        this.databaseService.chat.count({
          where: {
            broadcastId: broadcast.id,
            Status: 'skipped',
          },
        }),
        this.databaseService.chat.count({
          where: {
            broadcastId: broadcast.id,
            Status: 'failed',
          },
        }),
        this.databaseService.chat.groupBy({
          by: ['failedReason'],
          where: {
            broadcastId: broadcast.id,
            Status: 'skipped',
            failedReason: { not: null },
          },
          _count: { _all: true },
        }),
        this.databaseService.chat.groupBy({
          by: ['failedReason'],
          where: {
            broadcastId: broadcast.id,
            Status: 'failed',
            failedReason: { not: null },
          },
          _count: { _all: true },
        }),
        this.databaseService.chat.count({
          where: {
            broadcastId: broadcast.id,
            Status: 'sent',
          },
        }),
      ]);
      const config = getWhatsappConfig(business);

      const Templates = await this.whatsappService.findSpecificTemplate(
        config,
        broadcast.template_name
      );
      console.log(Templates);
 

      // Transform the groupBy results to have a 'count' property
      const transformedSkippedReasonGroups = skippedReasonGroups.map(
        (group: any) => ({
          failedReason: group.failedReason,
          count: group._count._all,
        }),
      );

      const transformedFailedReasonGroups = failedReasonGroups.map(
        (group: any) => ({
          failedReason: group.failedReason,
          count: group._count._all,
        }),
      );

      return {
        ...broadcast,
        totalMessages,
        deliveredCount,
        readCount,
        skippedCount,
        failedCount,
        sentCount,
        skippedReasonGroups: transformedSkippedReasonGroups,
        failedReasonGroups: transformedFailedReasonGroups,
        template: Templates.data[0],
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error);
    }
  }

  async retrybroadcast(body: any, req: any): Promise<any> {
    try {
      const { id } = body;
      const business = req.user.business;
      console.log(id);

      // Fetch a single broadcast for this business
      const broadcast = await this.databaseService.broadcast.findUnique({
        where: {
          createdForId: business.id,
          id: id,
        },
        include: {
          creator: { include: { business: true } },
          retry: { orderBy: { created_at: 'desc' } },
        },
      });
      if (broadcast.retry.length >= 3) {
        throw new BadRequestException('limit reached for retries');
      }

      if (!broadcast) {
        throw new NotFoundException('Broadcast not found');
      }
      const latestRetry =
        broadcast.retry.length > 0 ? broadcast.retry[0] : null;
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
        throw new BadRequestException('no failed messages found');
      }

      const createretry = await this.databaseService.retry.create({
        data: {
          
          broadcastId: broadcast.id,
        },
      });
      await this.broadcastRetryQueue.add(
        'retryJob',
        { broadcastId: broadcast.id, retryId: createretry.id },
        { delay: 0 },
      );
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async getBroadcastRetry(id: string, req: any): Promise<any> {
    try {
      const business = req.user.business;
      const retries = await this.databaseService.retry.findMany({
        where: { broadcastId: id, Broadcast: { createdForId: business.id } },
        include: { Chat: true },
      });

      const countsPerRetry = retries.map((retry) => {
        const failedCount = retry.Chat.filter(
          (chat) => chat.Status === 'failed',
        ).length;
        const deliveredCount = retry.Chat.filter(
          (chat) => chat.Status !== 'failed' || 'skipped',
        ).length;
        return {
          retryId: retry.id,
          failedCount,
          deliveredCount,
          status: retry.status,
          createdAt: retry.created_at,
        };
      });

      return countsPerRetry;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error);
    }
  }
}
