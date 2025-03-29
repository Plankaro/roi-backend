import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { JobData } from './checkout-create-processor';
import { sanitizePhoneNumber } from 'utils/usefulfunction';
import { getFutureTimestamp } from 'utils/usefulfunction';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
@Injectable()
@Processor('cancelOrderQueue')
export class cancelOrderQueue extends  WorkerHost{
    constructor(private readonly databaseService: DatabaseService,
        @InjectQueue('cancelOrderQueue') private readonly cancelOrderQueue: Queue,
    ) {
        super();
    }
    async process(job: Job<any>): Promise<void> {
        // try {
        //     const {cancelOrderData,domain} =  job.data;
        //     const sanitizedPhone = sanitizePhoneNumber(cancelOrderData.phone);

        //     const updateOrder = await this.databaseService.order.update({
        //         where: {
        //             shopify_id: `${cancelOrderData.order_id}`,
        //         },
        //         data: {
        //             cancelled_at: cancelOrderData.cancelled_at,
        //             cancel_reason: cancelOrderData.cancel_reason
        //         },
        //     })

        //     const getCampaigns = await this.databaseService.campaign.findMany({
        //         where: {
        //             type: 'ORDER_CANCELLED',
        //             createdForId: domain,
        //         },
        //         include: {
        //             OrderCancelCampaign: true,
        //         },
        //     })
        //     getCampaigns.forEach(async (campaign) => {
        //         const time =campaign.OrderCancelCampaign.trigger_type ==="AFTER_CAMPAIGN_CREATED"? 0: getFutureTimestamp(campaign.OrderCancelCampaign.trigger_time)
        //         this.cancelOrderQueue
        //          .add(
        //            'createOrderCampaignQueue',
        //            { campaignId: campaign.id,orderId: updateOrder.id },
                   
        //            {
        //              delay: time,
        //              removeOnComplete: true,
        //            },
        //          )
        //          .then((job) => {
        //            console.log('Job added to createCheckoutCampaignQueue:', job.id);
        //          })
        //          .catch((error) => {
        //            console.error('Error adding job:', error);
        //          });
                
        //     })
            
        // } catch (error) {
            
        // }
    }
}
