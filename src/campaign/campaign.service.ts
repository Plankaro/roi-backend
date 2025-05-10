import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { DatabaseService } from 'src/database/database.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';

@Injectable()
export class CampaignService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createrCampaign(createCampaignDto: CreateCampaignDto, req: any) {
   try {
     const user = req.user;
    if(user.manageCampaign !== true) throw new BadRequestException('You are not allowed to create campaign');
    
     console.log(createCampaignDto);
    
 
     const createOrderCampaign = await this.databaseService.campaign.create({
       data: {
         name: createCampaignDto.name,
         type: createCampaignDto.type,
         trigger: createCampaignDto.trigger,
         User: { connect: { id: user.id } },
         Business: { connect: { id: user.business.id } },
         template_name: createCampaignDto.template_name,
         template_lang: createCampaignDto.template_language,
         template_type: createCampaignDto.template_category,
         components: createCampaignDto.templateForm as any,
         trigger_type: createCampaignDto.trigger_type,
         trigger_time: createCampaignDto.trigger_time as any,
         reply_action: createCampaignDto.reply_action,
         filter_condition_match: createCampaignDto.filter_condition_match,
         new_checkout_abandonment_filter:
           createCampaignDto.new_checkout_abandonment_filter,
         new_checkout_abandonment_type:
           createCampaignDto.new_checkout_abandonment_type,
         new_checkout_abandonment_time:
           createCampaignDto.new_checkout_abandonment_time as any,
         new_order_creation_filter: createCampaignDto.new_order_creation_filter,
         new_order_creation_type: createCampaignDto.new_order_creation_type,
         new_order_creation_time:
           createCampaignDto.new_order_creation_time as any,
         related_order_created: createCampaignDto.related_order_created,
         related_order_cancelled: createCampaignDto.related_order_cancelled,
         related_order_fulfilled: createCampaignDto.related_order_fulfilled,
         discount_type: createCampaignDto.discount_type,
         discount: createCampaignDto.discount,
         filters: {
           create: {
             // 1. Tag filters
             is_order_tag_filter_enabled:        createCampaignDto.filter.is_order_tag_filter_enabled,
             order_tag_filter_all:               createCampaignDto.filter.order_tag_filter_all,
             order_tag_filter_any:               createCampaignDto.filter.order_tag_filter_any,
             order_tag_filter_none:              createCampaignDto.filter.order_tag_filter_none,
         
             is_product_tag_filter_enabled:      createCampaignDto.filter.is_product_tag_filter_enabled,
             product_tag_filter_all:             createCampaignDto.filter.product_tag_filter_all,
             product_tag_filter_any:             createCampaignDto.filter.product_tag_filter_any,
             product_tag_filter_none:            createCampaignDto.filter.product_tag_filter_none,
         
             is_customer_tag_filter_enabled:     createCampaignDto.filter.is_customer_tag_filter_enabled,
             customer_tag_filter_all:            createCampaignDto.filter.customer_tag_filter_all,
             customer_tag_filter_any:            createCampaignDto.filter.customer_tag_filter_any,
             customer_tag_filter_none:           createCampaignDto.filter.customer_tag_filter_none,
         
             // 2. Discount-code filters
             is_discount_code_filter_enabled:    createCampaignDto.filter.is_discount_code_filter_enabled,
             discount_code_filter_any:           createCampaignDto.filter.discount_code_filter_any,
             discount_code_filter_none:          createCampaignDto.filter.discount_code_filter_none,
         
             // 3. Payment gateway & option filters
             is_payment_gateway_filter_enabled:  createCampaignDto.filter.is_payment_gateway_filter_enabled,
             payment_gateway_filter_any:         createCampaignDto.filter.payment_gateway_filter_any,
             payment_gateway_filter_none:        createCampaignDto.filter.payment_gateway_filter_none,
         
             is_payment_option_filter_enabled:   createCampaignDto.filter.is_payment_option_filter_enabled,
             payment_options_type:               createCampaignDto.filter.payment_options_type,
         
             // 4. Unsubscribed-customer filter
             is_send_to_unsub_customer_filter_enabled:
               createCampaignDto.filter.is_send_to_unsub_customer_filter_enabled,
             send_to_unsub_customer:             createCampaignDto.filter.send_to_unsub_customer,
         
             // 5. Order-amount filters
             is_order_amount_filter_enabled:     createCampaignDto.filter.is_order_amount_filter_enabled,
             order_amount_type:                  createCampaignDto.filter.order_amount_filter_type,
             order_amount_filter_greater_or_equal:
               createCampaignDto.filter.order_amount_filter_greater_or_equal,
             order_amount_filter_less_or_equal:  createCampaignDto.filter.order_amount_filter_less_or_equal,
             order_amount_min:                   createCampaignDto.filter.order_amount_min,
             order_amount_max:                   createCampaignDto.filter.order_amount_max,
         
             // 6. Discount-amount filters
             is_discount_amount_filter_enabled:  createCampaignDto.filter.is_discount_amount_filter_enabled,
             discount_amount_type:               createCampaignDto.filter.discount_amount_filter_type,
             discount_amount_filter_greater_or_equal:
               createCampaignDto.filter.discount_amount_filter_greater_or_equal,
             discount_amount_filter_less_or_equal:
               createCampaignDto.filter.discount_amount_filter_less_or_equal,
             discount_amount_min:                createCampaignDto.filter.discount_amount_min,
             discount_amount_max:                createCampaignDto.filter.discount_amount_max,
         
             // 7. Order-count filters
             is_order_count_filter_enabled:      createCampaignDto.filter.is_order_count_filter_enabled,
             order_count_type:                   createCampaignDto.filter.order_count_filter_type,
             order_count_filter_greater_or_equal:       createCampaignDto.filter.order_count_filter_greater_or_equal,
             order_count_filter_less_or_equal:          createCampaignDto.filter.order_count_filter_less_or_equal,
             order_count_min:                    createCampaignDto.filter.order_count_min,
             order_count_max:                    createCampaignDto.filter.order_count_max  ,
         
             // 8. Delivery filter
             is_order_delivery_filter_enabled:   createCampaignDto.filter.is_order_delivery_filter_enabled,
             order_method:                       createCampaignDto.filter.order_method,
           },
         },
         
       },
     });
 
     return createOrderCampaign;
   } catch (error) {
    console.log(error);
    throw new Error(error);
    
   }
  }
  async updateCampaign(
    updateCampaignDto: UpdateCampaignDto,
    req: any,
    id: string,
  ) {
    try {
      const user = req.user;
      console.log(user, updateCampaignDto);
      console.log(updateCampaignDto.reply_action, 'reply_action');

      const updatedCampaign = await this.databaseService.campaign.update({
        where: {
          id: id,
        },
        data: {
          name: updateCampaignDto.name,
          type: updateCampaignDto.type,
          trigger: updateCampaignDto.trigger,

          template_name: updateCampaignDto.template_name,
          reply_action: updateCampaignDto.reply_action,
          template_lang: updateCampaignDto.template_language,
          template_type: updateCampaignDto.template_category,
          components: updateCampaignDto.templateForm as any,
          trigger_type: updateCampaignDto.trigger_type,
          trigger_time: updateCampaignDto.trigger_time as any,
          filter_condition_match: updateCampaignDto.filter_condition_match,
          new_checkout_abandonment_filter:
            updateCampaignDto.new_checkout_abandonment_filter,
          new_checkout_abandonment_type:
            updateCampaignDto.new_checkout_abandonment_type,
          new_checkout_abandonment_time:
            updateCampaignDto.new_checkout_abandonment_time as any,
          new_order_creation_filter:
            updateCampaignDto.new_order_creation_filter,
          new_order_creation_type: updateCampaignDto.new_order_creation_type,
          new_order_creation_time:
            updateCampaignDto.new_order_creation_time as any,
          related_order_created: updateCampaignDto.related_order_created,
          related_order_cancelled: updateCampaignDto.related_order_cancelled,
          related_order_fulfilled: updateCampaignDto.related_order_fulfilled,
          discount_type: updateCampaignDto.discount_type,
          discount: updateCampaignDto.discount,

          filters: {
            update: {
              // 1. Tag filters
              is_order_tag_filter_enabled:        updateCampaignDto.filter.is_order_tag_filter_enabled,
              order_tag_filter_all:               updateCampaignDto.filter.order_tag_filter_all,
              order_tag_filter_any:               updateCampaignDto.filter.order_tag_filter_any,
              order_tag_filter_none:              updateCampaignDto.filter.order_tag_filter_none,
          
              is_product_tag_filter_enabled:      updateCampaignDto.filter.is_product_tag_filter_enabled,
              product_tag_filter_all:             updateCampaignDto.filter.product_tag_filter_all,
              product_tag_filter_any:             updateCampaignDto.filter.product_tag_filter_any,
              product_tag_filter_none:            updateCampaignDto.filter.product_tag_filter_none,
          
              is_customer_tag_filter_enabled:     updateCampaignDto.filter.is_customer_tag_filter_enabled,
              customer_tag_filter_all:            updateCampaignDto.filter.customer_tag_filter_all,
              customer_tag_filter_any:            updateCampaignDto.filter.customer_tag_filter_any,
              customer_tag_filter_none:           updateCampaignDto.filter.customer_tag_filter_none,
          
              // 2. Discount-code filters
              is_discount_code_filter_enabled:    updateCampaignDto.filter.is_discount_code_filter_enabled,
              discount_code_filter_any:           updateCampaignDto.filter.discount_code_filter_any,
              discount_code_filter_none:          updateCampaignDto.filter.discount_code_filter_none,
          
              // 3. Payment gateway & option filters
              is_payment_gateway_filter_enabled:  updateCampaignDto.filter.is_payment_gateway_filter_enabled,
              payment_gateway_filter_any:         updateCampaignDto.filter.payment_gateway_filter_any,
              payment_gateway_filter_none:        updateCampaignDto.filter.payment_gateway_filter_none,
          
              is_payment_option_filter_enabled:   updateCampaignDto.filter.is_payment_option_filter_enabled,
              payment_options_type:               updateCampaignDto.filter.payment_options_type,
          
              // 4. Unsubscribed-customer filter
              is_send_to_unsub_customer_filter_enabled:
                updateCampaignDto.filter.is_send_to_unsub_customer_filter_enabled,
              send_to_unsub_customer:             updateCampaignDto.filter.send_to_unsub_customer,
          
              // 5. Order-amount filters
              is_order_amount_filter_enabled:     updateCampaignDto.filter.is_order_amount_filter_enabled,
              order_amount_type:                  updateCampaignDto.filter.order_amount_filter_type,
              order_amount_filter_greater_or_equal:
                updateCampaignDto.filter.order_amount_filter_greater_or_equal,
              order_amount_filter_less_or_equal:  updateCampaignDto.filter.order_amount_filter_less_or_equal,
              order_amount_min:                   updateCampaignDto.filter.order_amount_min,
              order_amount_max:                   updateCampaignDto.filter.order_amount_max,
          
              // 6. Discount-amount filters
              is_discount_amount_filter_enabled:  updateCampaignDto.filter.is_discount_amount_filter_enabled,
              discount_amount_type:               updateCampaignDto.filter.discount_amount_filter_type,
              discount_amount_filter_greater_or_equal:
                updateCampaignDto.filter.discount_amount_filter_greater_or_equal,
              discount_amount_filter_less_or_equal:
                updateCampaignDto.filter.discount_amount_filter_less_or_equal,
              discount_amount_min:                updateCampaignDto.filter.discount_amount_min,
              discount_amount_max:                updateCampaignDto.filter.discount_amount_max,
          
              // 7. Order-count filters
              is_order_count_filter_enabled:      updateCampaignDto.filter.is_order_count_filter_enabled,
              order_count_type:                   updateCampaignDto.filter.order_count_filter_type,
              order_count_filter_greater_or_equal:       updateCampaignDto.filter.order_count_filter_greater_or_equal,
              order_count_filter_less_or_equal:          updateCampaignDto.filter.order_count_filter_less_or_equal,
              order_count_min:                    updateCampaignDto.filter.order_count_min,
              order_count_max:                    updateCampaignDto.filter.order_count_max,
          
              // 8. Delivery filter
              is_order_delivery_filter_enabled:   updateCampaignDto.filter.is_order_delivery_filter_enabled,
              order_method:                       updateCampaignDto.filter.order_method,
            },
          },
        },
      });

      return updatedCampaign;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Failed to update campaign');
    }
  }

  async changeCampaignStatus(id: string, status: any, req: any) {
    try {
      const user = req.user;
      if (!status) {
        throw new BadRequestException('status is required');
      }
      const campaign = await this.databaseService.campaign.findUnique({
        where: {
          id,
          businessId: user.business.id,
        },
      });

      if (!campaign) {
        throw new BadRequestException('Campaign not found');
      }

      const updatedCampaign = await this.databaseService.campaign.update({
        where: {
          id,
        },
        data: {
          status: status.status,
        },
      });
      console.log(updatedCampaign);

      return { status: updatedCampaign.status };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Failed to update campaign');
    }
  }

  async getCampaigns(req: any) {
    const user = req.user;
    const campaigns = await this.databaseService.campaign.findMany({
      where: {
        businessId: user.business.id,
      },
      select: {
        id: true,
        name: true,
        type: true,
        trigger: true,
        status: true,
      },
    });

    const results = await Promise.all(
      campaigns.map(async (campaign) => {
        // Chat counts
        const [
          totalMessages,
          deliveredCount,
          readCount,
          skippedCount,
          failedCount,
        ] = await Promise.all([
          this.databaseService.chat.count({
            where: { campaignId: campaign.id },
          }),
          this.databaseService.chat.count({
            where: {
              campaignId: campaign.id,
              Status: { in: ['delivered', 'read'] },
            },
          }),
          this.databaseService.chat.count({
            where: {
              campaignId: campaign.id,
              Status: 'read',
            },
          }),
          this.databaseService.chat.count({
            where: {
              campaignId: campaign.id,
              Status: 'skipped',
            },
          }),
          this.databaseService.chat.count({
            where: {
              campaignId: campaign.id,
              Status: 'failed',
            },
          }),
        ]);

        const orders = await this.databaseService.order.findMany({
          where:{
            linkTrack:{
              campaign_id: campaign.id
            }
          },
          select:{
            amount: true,
            id: true
          }
        })

        // Abandoned Checkout Recovered:
        // Here we assume that the Checkout model is linked to a campaign via a relation (e.g., CheckoutOnCampaign)
        // and that you can filter with a relation filter.
        // const recoveredCheckouts = await this.databaseService.checkout.findMany({
        //   where: {
        //     // Adjust the relation filter according to your schema.
        //     campaigns: {
        //       some: { campaignId: campaign.id },
        //     },
        //     completedAt: { not: null },
        //   },
        //   select: {
        //     totalPrice: true,
        //   },
        // });
        // const abondnedCheckoutRecovered = recoveredCheckouts.length;
        // const abondnedCheckoutRecoveredAmount = recoveredCheckouts.reduce(
        //   (sum, checkout) =>
        //     sum + parseFloat(checkout.totalPrice || "0"),
        //   0
        // );

        // // COD to Checkout:
        // // This query finds PaymentLink records for the campaign (using campaign_id)
        // // with a status of 'paid'
        // const paidPaymentLinks = await this.databaseService.paymentLink.findMany({
        //   where: {
        //     campaign_id: campaign.id, // Adjust field name if necessary (e.g., campaignId)
        //     status: 'paid',
        //   },
        //   select: {
        //     amount: true,
        //   },
        // });
        // const codtoCheckout = paidPaymentLinks.length;
        // const codtoCheckoutRecoveredAmount = paidPaymentLinks.reduce(
        //   (sum, link) =>
        //     sum + parseFloat(link.amount || "0"),
        //   0
        // );

       
        return {
          ...campaign,
          totalMessages,
          deliveredCount,
          readCount,
          skippedCount,
          failedCount,
          orders,
          // abondnedCheckoutRecovered,
          // abondnedCheckoutRecoveredAmount,
          // codtoCheckout,
          // codtoCheckoutRecoveredAmount,
        };
      }),
    );

    return results;
  }

  async getSingleCampaign(id: string, req: any) {
    const user = req.user;
    const campaign = await this.databaseService.campaign.findUnique({
      where: {
        id,
        businessId: user.business.id,
      },
      include: {
        filters: true,
      },
    });
    console.log(campaign);

    if (!campaign) {
      throw new BadRequestException('Campaign not found');
    }

    return campaign;
  }
}
