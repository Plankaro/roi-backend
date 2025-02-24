import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { DatabaseService } from 'src/database/database.service';
import { calculateDelay, getWhatsappConfig, mergeDateTime } from 'utils/usefulfunction';
import { CreateBroadcastDto } from './dto/create-broadcast.dto';
import { Broadcast } from '@prisma/client';
import { format } from "date-fns";

@Injectable()
export class BroadcastService {
  constructor(
    @InjectQueue('broadcastQueue') private readonly broadcastQueue: Queue,
    private readonly databaseService: DatabaseService,
   

  ) {}

  async create(createBroadcastDto: any,req:any): Promise<Broadcast> {
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
const user = req.user
    const broadcastData:any = {
      name,
      type,
      componentData:templateForm,
      ...(utmParameters.utm_campaign.enabled && { utm_campaign: utmParameters.utm_campaign.value }) ,
      ...(utmParameters.utm_source.enabled && { utm_source: utmParameters.utm_source.value }),
      ...(utmParameters.utm_medium.enabled && { utm_medium: utmParameters.utm_medium.value }) ,
      utm_term: utmParameters.utm_term,
      utm_id: utmParameters.utm_id,
      avoid_duplicate:advanceFilters.avoidDuplicateContacts.enabled,
     skip_inactive_contacts_enabled :advanceFilters.skipInactiveContacts.enabled,
     limit_marketing_message_enabled:advanceFilters.limitMarketingMessages.enabled,
      template_name:template.name,
      template_language :template.language,
      onlimit_exced:onlimitexced,
      price:`5000`,
      createdBy:user.id,
      createdForId:user.business.id,


      


    }
    console.log(contact.type);

    if(contact.type === 'shopify'){
      broadcastData.contacts_type = 'shopify',
      broadcastData.segment_id= contact.id.match(/\d+$/)?.[0]
    }
    if(contact.type === 'excel'){
      broadcastData.contacts_type = 'excel',
      broadcastData.excelData = {
        data:contact.data,
        selectedField:contact.selectedField

      }
    }

    if(advanceFilters.skipInactiveContacts.enabled){
    
      broadcastData.skip_inactive_contacts_days = advanceFilters.skipInactiveContacts.days
    }

    if(advanceFilters.limitMarketingMessages.enabled){
    
      broadcastData.limit_marketing_message_messagenumber = advanceFilters.limitMarketingMessages.maxMessages
      broadcastData.limit_marketing_message_duration = `${advanceFilters.limitMarketingMessages.timeRange} ${advanceFilters.limitMarketingMessages.timeUnit}`
     
    }
    let delay=0;

    if(schedule){
      const mergedDateTime = mergeDateTime(schedule.date,schedule.time)



      broadcastData.isScheduled = schedule.schedule
      broadcastData.scheduledDate = mergedDateTime
    }

    console.log(JSON.stringify(broadcastData,null,2));

    

    const createBroadcast = await this.databaseService.broadcast.create({
      data: {
        ...broadcastData
      }
    });
    if(broadcastData.isScheduled){
      delay = calculateDelay(createBroadcast.scheduledDate)
    }
    console.log(delay);


    // Build message components
    // const components = [];
    // if (header && header.isEditable) {
    //   if (header.type === 'TEXT') {
    //     if (parameter_format === 'NAMED' && header.parameter_name) {
    //       components.push({
    //         type: 'header',
    //         parameters: [{ type: 'text', parameter_name: header.parameter_name, text: header.value }],
    //       });
    //     } else {
    //       components.push({
    //         type: 'header',
    //         parameters: [{ type: 'text', text: header.value }],
    //       });
    //     }
    //   } else if (header.type === 'IMAGE') {
    //     components.push({
    //       type: 'header',
    //       parameters: [{ type: 'image', image: { link: header.value } }],
    //     });
    //   } else if (header.type === 'VIDEO') {
    //     components.push({
    //       type: 'header',
    //       parameters: [{ type: 'video', video: { link: header.value } }],
    //     });
    //   } else if (header.type === 'DOCUMENT') {
    //     components.push({
    //       type: 'header',
    //       parameters: [{ type: 'document', document: { link: header.value } }],
    //     });
    //   }
    // }

    // const bodyParameters = body.map((param) =>
    //   parameter_format === 'NAMED'
    //     ? { type: 'text', parameter_name: param.parameter_name, text: param.value }
    //     : { type: 'text', text: param.value }
    // );
    // components.push({ type: 'body', parameters: bodyParameters });
    // buttons.forEach((button, index) => {
    //   if (button.type === 'URL' && button.isEditable === true) {
    //     components.push({
    //       type: 'button',
    //       sub_type: 'url',
    //       index: '0',
    //       parameters: [{ type: 'text', text: button.value }],
    //     });
    //   } else if (button.type === 'COPY_CODE') {
    //     components.push({
    //       type: 'button',
    //       sub_type: 'copy_code',
    //       index: index,
    //       parameters: [{ type: 'otp', text: encodeURI(button.value) }],
    //     });
    //   }
    // });

    // const buisness = req.user.business
    // const config = getWhatsappConfig(buisness)
    // // Save broadcast record to database.
    // const createBroadcast = await this.databaseService.broadcast.create({
    //   data: {
    //     template: template_name,
    //     type: type,
       
    //     status: 'pending',
    //     utm_source: utm_source,
    //     utm_campaign: utm_campaign,
    //     utm_params: utm_params,
    //     price: price,
    //     is_utm_id_embeded: is_utm_id_embeded,
    //     isScheduled: scheduledTime ? true : false,
    //     createdForId: buisness.id
    //   },
    // });

    // // Convert recipientNo to array if it isn’t already.
    // const recipientsArray = Array.isArray(recipientNo) ? recipientNo : [recipientNo];

 
  
 
    // // For demonstration, schedule the job 1 minute from now.
    // // const scheduledTime = new Date(Date.now() + 1 * 60 * 1000);
    // const delay = scheduledTime ? scheduledTime.getTime() - Date.now() : 0;

await this.broadcastQueue.add('sendBroadcast',{id:createBroadcast.id,template:template},{delay: delay,removeOnComplete: true})
    // await this.broadcastQueue.add(
    //   'sendBroadcast',
    //   {
    //     templatetype:template_type,
    //     broadastContactId: createBroadcast.id,
    //     recipients: recipientsArray,
    //     templateName: template_name,
    //     languageCode: language,
    //     components,
    //     previewSection,
    //     DeadAudienceFilteringEnabled,
    //     DeadAudienceFilteringTiming,
    //     MarketingmessagesfreqControlEnabled,
    //     MarketingmessageLimit,
    //     MarketingmessageLimitTiming,
    //     SkipDuplicates,
    //     config
        
    //   },
    //   {
    //     delay,       // Delay until the scheduled time
    //     attempts: 1, 
    //     removeOnComplete: true,// No automatic retries; handled in the processor on rate limit
    //   },
      
    // );

    return createBroadcast;
  }

  async getAllBroadcasts(req:any){
    try {
      const buisness = req.user.business
    const config = getWhatsappConfig(buisness)
      const result = await this.databaseService.broadcast.findMany({
        where:{
          createdForId:config.whatsappMobile
        }
      })
      return result;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
  async getBroadcastById(id: string,req:any){
    try {
      const buisness = req.user.business
    const config = getWhatsappConfig(buisness)
      const result = await this.databaseService.broadcast.findUnique({
        where: {

          id: id,
          createdForId:config.whatsappMobile
        },

      
      
      });
      const statusCounts = await this.databaseService.chat.groupBy({
        by: ['Status'],
        where: {
          broadcastId: result.id, // replace with your broadcast ID
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
