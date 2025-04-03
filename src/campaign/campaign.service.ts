import { Injectable } from '@nestjs/common';

import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class CampaignService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createrCampaign(createCampaignDto: any, req: any) {
    const user = req.user;
    console.log(user, createCampaignDto);

    const createOrderCampaign = await this.databaseService.campaign.create({
      data: {
        name: createCampaignDto.name,
        type: createCampaignDto.type,
        trigger: createCampaignDto.trigger,
        User: { connect: { id: user.id } },
        Business: { connect: { id: user.business.id } },
        template_name: createCampaignDto.template.name,
        template_lang: createCampaignDto.template.language,
        template_type: createCampaignDto.template.category,
        components: createCampaignDto.templateForm,
        trigger_type: createCampaignDto.trigger_type,
        trigger_time: createCampaignDto.trigger_time,
        filter_condition_match: createCampaignDto.filter_condition_match,
        new_checkout_abandonment_filter:
          createCampaignDto.new_checkout_abandonment_filter,
        new_checkout_abandonment_type:
          createCampaignDto.new_checkout_abandonment_type,
        new_checkout_abandonment_time:
          createCampaignDto.new_checkout_abandonment_time,
        new_order_creation_filter: createCampaignDto.new_order_creation_filter,
        new_order_creation_type: createCampaignDto.new_order_creation_type,
        new_order_creation_time: createCampaignDto.new_order_creation_time,
        related_order_created: createCampaignDto.related_order_created,
        related_order_cancelled: createCampaignDto.related_order_fullfilled,
        discount_type: createCampaignDto.discount_type,
        discount: createCampaignDto.discount,

        filters: {
          create: {
            is_order_tag_filter_enabled:
              createCampaignDto.filter.is_order_tag_filter_enabled,
            order_tag_filter_all: createCampaignDto.filter.order_tag_filter_all,
            order_tag_filter_any: createCampaignDto.filter.order_tag_filter_any,
            order_tag_filter_none:
              createCampaignDto.filter.order_tag_filter_none,
            is_product_tag_filter_enabled:
              createCampaignDto.filter.is_product_tag_filter_enabled,
            product_tag_filter_all:
              createCampaignDto.filter.product_tag_filter_all,
            product_tag_filter_any:
              createCampaignDto.filter.product_tag_filter_any,
            product_tag_filter_none:
              createCampaignDto.filter.product_tag_filter_none,
            is_customer_tag_filter_enabled:
              createCampaignDto.filter.is_customer_tag_filter_enabled,
            customer_tag_filter_all:
              createCampaignDto.filter.customer_tag_filter_all,
            customer_tag_filter_any:
              createCampaignDto.filter.customer_tag_filter_any,
            customer_tag_filter_none:
              createCampaignDto.filter.customer_tag_filter_none,
            is_discount_code_filter_enabled:
              createCampaignDto.filter.is_discount_code_filter_enabled,
            discount_code_filter_any:
              createCampaignDto.filter.discount_code_filter_any,
            discount_code_filter_none:
              createCampaignDto.filter.discount_code_filter_none,
            is_payment_gateway_filter_enabled:
              createCampaignDto.filter.is_payment_gateway_filter_enabled,
            payment_gateway_filter_any:
              createCampaignDto.filter.payment_gateway_filter_any,
            payment_gateway_filter_none:
              createCampaignDto.filter.payment_gateway_filter_none,
            is_payment_option_filter_enabled:
              createCampaignDto.filter.is_payment_option_filter_enabled,
            payment_options_type: createCampaignDto.filter.payment_options_type,
            send_to_unsub_customer:
              createCampaignDto.filter.send_to_unsub_customer,
            is_order_amount_filter_enabled:
              createCampaignDto.filter.is_order_amount_filter_enabled,
            order_amount_filter_greater_or_equal:
              createCampaignDto.filter.order_amount_filter_greater_or_equal,
            order_amount_filter_less_or_equal:
              createCampaignDto.filter.order_amount_filter_less_or_equal,
            order_amount_min: createCampaignDto.filter.order_amount_min,
            order_amount_max: createCampaignDto.filter.order_amount_max,
            is_discount_amount_filter_enabled:
              createCampaignDto.filter.is_discount_amount_filter_enabled,
            discount_amount_filter_greater_or_equal:
              createCampaignDto.filter.discount_amount_filter_greater_or_equal,
            discount_amount_filter_less_or_equal:
              createCampaignDto.filter.discount_amount_filter_less_or_equal,
            discount_amount_min: createCampaignDto.filter.discount_amount_min,
            discount_amount_max: createCampaignDto.filter.discount_amount_max,
            is_order_delivery_filter_enabled:
              createCampaignDto.filter.is_order_delivery_filter_enabled,
            order_method: createCampaignDto.filter.order_method,
          },
        },
      },
    });

    return createOrderCampaign;
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
  
        // Abandoned Checkout Recovered:
        // Here we assume that the Checkout model is linked to a campaign via a relation (e.g., CheckoutOnCampaign)
        // and that you can filter with a relation filter.
        const recoveredCheckouts = await this.databaseService.checkout.findMany({
          where: {
            // Adjust the relation filter according to your schema.
            campaigns: {
              some: { campaignId: campaign.id },
            },
            completedAt: { not: null },
          },
          select: {
            totalPrice: true,
          },
        });
        const abondnedCheckoutRecovered = recoveredCheckouts.length;
        const abondnedCheckoutRecoveredAmount = recoveredCheckouts.reduce(
          (sum, checkout) =>
            sum + parseFloat(checkout.totalPrice || "0"),
          0
        );
  
        // COD to Checkout:
        // This query finds PaymentLink records for the campaign (using campaign_id)
        // with a status of 'paid'
        const paidPaymentLinks = await this.databaseService.paymentLink.findMany({
          where: {
            campaign_id: campaign.id, // Adjust field name if necessary (e.g., campaignId)
            status: 'paid',
          },
          select: {
            amount: true,
          },
        });
        const codtoCheckout = paidPaymentLinks.length;
        const codtoCheckoutRecoveredAmount = paidPaymentLinks.reduce(
          (sum, link) =>
            sum + parseFloat(link.amount || "0"),
          0
        );
  
        return {
          ...campaign,
          totalMessages,
          deliveredCount,
          readCount,
          skippedCount,
          failedCount,
          abondnedCheckoutRecovered,
          abondnedCheckoutRecoveredAmount,
          codtoCheckout,
          codtoCheckoutRecoveredAmount,
        };
      })
    );
  
    return results;
  }
  
}
