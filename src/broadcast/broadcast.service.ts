import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class BroadcastService {
  constructor(
    @InjectQueue('broadcastQueue') private readonly broadcastQueue: Queue,
    private readonly databaseService: DatabaseService,
  ) {}

  async create(createBroadcastDto: any): Promise<string> {
    const {
      body,              // Array of body objects
      buttons,           // Array of buttons
      header,            // Header object
      language,          // Language string
      parameter_format,  // Format type
      recipientNo,       // Recipient's phone numbers (string or array)
      template_name,
      template_type, // Template name
      previewSection,
      type,
      DeadAudienceFilteringEnabled,
      DeadAudienceFilteringTiming,
      MarketingmessagesfreqControlEnabled,
      MarketingmessageLimit,
      MarketingmessageLimitTiming,
      SkipDuplicates,
      utm_params,
      utm_source,
      utm_campaign,
      price,
      is_utm_id_embeded,
      scheduledTime
      

      // scheduledTime is now set automatically (for demo, 1 minute from now)
    } = createBroadcastDto;

    // Build message components
    const components = [];
    if (header && header.isEditable) {
      if (header.type === 'TEXT') {
        if (parameter_format === 'NAMED' && header.parameter_name) {
          components.push({
            type: 'header',
            parameters: [{ type: 'text', parameter_name: header.parameter_name, text: header.value }],
          });
        } else {
          components.push({
            type: 'header',
            parameters: [{ type: 'text', text: header.value }],
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

    const bodyParameters = body.map((param) =>
      parameter_format === 'NAMED'
        ? { type: 'text', parameter_name: param.parameter_name, text: param.value }
        : { type: 'text', text: param.value }
    );
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

    // Save broadcast record to database.
    const createBroadcast = await this.databaseService.broadcast.create({
      data: {
        template: template_name,
        type: type,
       
        status: 'pending',
        utm_source: utm_source,
        utm_campaign: utm_campaign,
        utm_params: utm_params,
        price: price,
        is_utm_id_embeded: is_utm_id_embeded,
        isScheduled: scheduledTime ? true : false,
      },
    });

    // Convert recipientNo to array if it isn’t already.
    const recipientsArray = Array.isArray(recipientNo) ? recipientNo : [recipientNo];

 
  
 
    // For demonstration, schedule the job 1 minute from now.
    // const scheduledTime = new Date(Date.now() + 1 * 60 * 1000);
    const delay = scheduledTime ? scheduledTime.getTime() - Date.now() : 0;


    await this.broadcastQueue.add(
      'sendBroadcast',
      {
        templatetype:template_type,
        broadastContactId: createBroadcast.id,
        recipients: recipientsArray,
        templateName: template_name,
        languageCode: language,
        components,
        previewSection,
        DeadAudienceFilteringEnabled,
        DeadAudienceFilteringTiming,
        MarketingmessagesfreqControlEnabled,
        MarketingmessageLimit,
        MarketingmessageLimitTiming,
        SkipDuplicates,
        
      },
      {
        delay,       // Delay until the scheduled time
        attempts: 1, 
        removeOnComplete: true,// No automatic retries; handled in the processor on rate limit
      },
      
    );

    return 'Broadcast created successfully';
  }

  async getAllBroadcasts(){
    try {
      const result = await this.databaseService.broadcast.findMany({})
      return result;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async getBroadcastById(id: string){
    try {
      const result = await this.databaseService.broadcast.findUnique({
        where: {

          id: id,
        },
        include:{
          Chat:true
        }
      
      });
      const statusCounts = await this.databaseService.chat.groupBy({
        by: ['Status'],
        where: {
          broadcastId: id, // replace with your broadcast ID
        },
        _count: {
          _all: true,
        },
      });

      if(!result) throw new NotFoundException("Couldn't find broadcast")
      return {result,statusCounts};
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
 

}
