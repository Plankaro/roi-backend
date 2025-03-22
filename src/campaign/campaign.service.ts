import { Injectable } from '@nestjs/common';

import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class CampaignService {
  constructor(private readonly databaseService: DatabaseService) {}

  async createOrderCampaign(createCampaignDto: any, req: any) {
    const user = req.user;
    console.log(user);

    const createOrderCampaign = await this.databaseService.campaign.create({
      data: {
        name: createCampaignDto.name,
        type: 'ORDER_CREATED',
        creator: { connect: { id: user.id } },
        createdFor: { connect: { id: user.business.id } },
        OrderCreatedCampaign: {
          create: {
            template_name: createCampaignDto.template_name,
            template_lang: createCampaignDto.template_lang,
            template_type: createCampaignDto.template_type,
            components: createCampaignDto.components,
            trigger_type: createCampaignDto.trigger_type,
            trigger_time: createCampaignDto.trigger_time,
            filter_condition_match: createCampaignDto.filter_condition_match,
            new_checkout_abandonment_filter:
              createCampaignDto.new_checkout_abandonment_filter,
            new_checkout_abandonment_type:
              createCampaignDto.new_checkout_abandonment_type,
            new_checkout_abandonment_time:
              createCampaignDto.new_checkout_abandonment_time,
            new_order_creation_filter:
              createCampaignDto.new_order_creation_filter,
            new_order_creation_type: createCampaignDto.new_order_creation_type,
            new_order_creation_time: createCampaignDto.new_order_creation_time,
            related_order_created: createCampaignDto.related_order_created,
            related_order_fullfilled:
              createCampaignDto.related_order_fullfilled,
          },
        },
        Filter: {
          create: {
            is_order_tag_filter_enabled:
              createCampaignDto.filter.is_order_tag_filter_enabled,
            order_tag_filer_all: createCampaignDto.filter.order_tag_filer_all,
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
            send_to_unsub_customer: createCampaignDto.send_to_unsub_customer,
            is_order_amount_filter_enabled:
              createCampaignDto.filter.is_order_amount_filter_enabled,
            order_amount_filter_greater_or_equal:
              createCampaignDto.filter.order_amount_filter_greater_or_equal,
            order_amount_filter_less_or_equal:
              createCampaignDto.filter.order_amount_filter_less_or_equal,
            order_amount_max: createCampaignDto.filter.order_amount_max,
            order_amount_min: createCampaignDto.filter.order_amount_min,
            is_discount_amount_filter_enabled:
              createCampaignDto.filter.is_discount_amount,
            discount_amount_filter_greater_or_equal:
              createCampaignDto.filter.discount_amount_filter_greater_or_equal,
            discount_amount_filter_less_or_equal:
              createCampaignDto.filter.discount_amount_filter_less_or_equal,
            discount_amount_max: createCampaignDto.filter.discount_amount_max,
            discount_amount_min: createCampaignDto.filter.discount_amount_min,
            is_order_delivery_filter_enabled:
              createCampaignDto.filter.is_order_delivery,
            order_method: createCampaignDto.filter.order_method,
          },
        },
      },
    });

    return createOrderCampaign;
  }

  async orderCancellationCampaign(orderCancellationCampaignDto: any, req: any) {
    const user = req.user;
    console.log(user);

    const orderCancel = await this.databaseService.campaign.create({
      data: {
        name: orderCancellationCampaignDto.name,
        type: 'ORDER_CANCELLED',
        creator: { connect: { id: user.id } },
        createdFor: { connect: { id: user.business.id } },
        OrderCreatedCampaign: {
          create: {
            template_name: orderCancellationCampaignDto.template_name,
            template_lang: orderCancellationCampaignDto.template_lang,
            template_type: orderCancellationCampaignDto.template_type,
            components: orderCancellationCampaignDto.components,
            trigger_type: orderCancellationCampaignDto.trigger_type,
            trigger_time: orderCancellationCampaignDto.trigger_time,
            filter_condition_match:
              orderCancellationCampaignDto.filter_condition_match,
            new_checkout_abandonment_filter:
              orderCancellationCampaignDto.new_checkout_abandonment_filter,
            new_checkout_abandonment_type:
              orderCancellationCampaignDto.new_checkout_abandonment_type,
            new_checkout_abandonment_time:
              orderCancellationCampaignDto.new_checkout_abandonment_time,
            new_order_creation_filter:
              orderCancellationCampaignDto.new_order_creation_filter,
            new_order_creation_type:
              orderCancellationCampaignDto.new_order_creation_type,
            new_order_creation_time:
              orderCancellationCampaignDto.new_order_creation_time,
            related_order_created:
              orderCancellationCampaignDto.related_order_created,
            related_order_fullfilled:
              orderCancellationCampaignDto.related_order_fullfilled,
          },
        },
        Filter: {
          create: {
            is_order_tag_filter_enabled:
              orderCancellationCampaignDto.filter.is_order_tag_filter_enabled,
            order_tag_filer_all:
              orderCancellationCampaignDto.filter.order_tag_filer_all,
            order_tag_filter_any:
              orderCancellationCampaignDto.filter.order_tag_filter_any,
            order_tag_filter_none:
              orderCancellationCampaignDto.filter.order_tag_filter_none,
            is_product_tag_filter_enabled:
              orderCancellationCampaignDto.filter.is_product_tag_filter_enabled,
            product_tag_filter_all:
              orderCancellationCampaignDto.filter.product_tag_filter_all,
            product_tag_filter_any:
              orderCancellationCampaignDto.filter.product_tag_filter_any,
            product_tag_filter_none:
              orderCancellationCampaignDto.filter.product_tag_filter_none,
            is_customer_tag_filter_enabled:
              orderCancellationCampaignDto.filter
                .is_customer_tag_filter_enabled,
            customer_tag_filter_all:
              orderCancellationCampaignDto.filter.customer_tag_filter_all,
            customer_tag_filter_any:
              orderCancellationCampaignDto.filter.customer_tag_filter_any,
            customer_tag_filter_none:
              orderCancellationCampaignDto.filter.customer_tag_filter_none,
            is_discount_code_filter_enabled:
              orderCancellationCampaignDto.filter
                .is_discount_code_filter_enabled,
            discount_code_filter_any:
              orderCancellationCampaignDto.filter.discount_code_filter_any,
            discount_code_filter_none:
              orderCancellationCampaignDto.filter.discount_code_filter_none,
            is_payment_gateway_filter_enabled:
              orderCancellationCampaignDto.filter
                .is_payment_gateway_filter_enabled,
            payment_gateway_filter_any:
              orderCancellationCampaignDto.filter.payment_gateway_filter_any,
            payment_gateway_filter_none:
              orderCancellationCampaignDto.filter.payment_gateway_filter_none,
            is_payment_option_filter_enabled:
              orderCancellationCampaignDto.filter
                .is_payment_option_filter_enabled,
            payment_options_type:
              orderCancellationCampaignDto.filter.payment_options_type,
            send_to_unsub_customer:
              orderCancellationCampaignDto.send_to_unsub_customer,
            is_order_amount_filter_enabled:
              orderCancellationCampaignDto.filter
                .is_order_amount_filter_enabled,
            order_amount_filter_greater_or_equal:
              orderCancellationCampaignDto.filter
                .order_amount_filter_greater_or_equal,
            order_amount_filter_less_or_equal:
              orderCancellationCampaignDto.filter
                .order_amount_filter_less_or_equal,
            order_amount_max:
              orderCancellationCampaignDto.filter.order_amount_max,
            order_amount_min:
              orderCancellationCampaignDto.filter.order_amount_min,
            is_discount_amount_filter_enabled:
              orderCancellationCampaignDto.filter.is_discount_amount,
            discount_amount_filter_greater_or_equal:
              orderCancellationCampaignDto.filter
                .discount_amount_filter_greater_or_equal,
            discount_amount_filter_less_or_equal:
              orderCancellationCampaignDto.filter
                .discount_amount_filter_less_or_equal,
            discount_amount_max:
              orderCancellationCampaignDto.filter.discount_amount_max,
            discount_amount_min:
              orderCancellationCampaignDto.filter.discount_amount_min,
            is_order_delivery_filter_enabled:
              orderCancellationCampaignDto.filter.is_order_delivery,
            order_method: orderCancellationCampaignDto.filter.order_method,
          },
        },
      },
    });

    return orderCancel;
  }

  async createCheckoutCampaign(createCheckoutDto: any, req: any) {
    const user = req.user;
    console.log(user);
    const createCheckoutCampaign = await this.databaseService.campaign.create({
      data: {
        name: createCheckoutDto.name,
        type: 'CHECKOUT_CREATED',
        creator: { connect: { id: user.id } }, // Ensure correct relation handling
        createdFor: { connect: { id: user.business.id } }, // Properly linking Business

        CheckoutCreatedCampaign: {
          create: {
            template_name: createCheckoutDto.template_name,
            template_lang: createCheckoutDto.template_lang,
            template_type: createCheckoutDto.template_type,
            components: createCheckoutDto.components,
            trigger_type: createCheckoutDto.trigger_type,
            trigger_time: createCheckoutDto.trigger_time,
            filter_condition_match: createCheckoutDto.filter_condition_match,
            new_checkout_abandonment_filter:
              createCheckoutDto.new_checkout_abandonment_filter,
            new_checkout_abandonment_type:
              createCheckoutDto.new_checkout_abandonment_type,
            new_checkout_abandonment_time:
              createCheckoutDto.new_checkout_abandonment_time,
            new_order_creation_filter:
              createCheckoutDto.new_order_creation_filter,
            new_order_creation_type: createCheckoutDto.new_order_creation_type,
            new_order_creation_time: createCheckoutDto.new_order_creation_time,
            related_order_created: createCheckoutDto.related_order_created,
            discount_type: createCheckoutDto.discount_type,
            discount: createCheckoutDto.discount,
            related_order_cancelled: createCheckoutDto.related_order_cancelled,
          },
        },
        Filter: {
          create: {
            is_order_tag_filter_enabled:
              createCheckoutDto.is_order_tag_filter_enabled,
            order_tag_filer_all: createCheckoutDto.order_tag_filer_all,
            order_tag_filter_any: createCheckoutDto.order_tag_filter_any,
            order_tag_filter_none: createCheckoutDto.order_tag_filter_none,
            is_product_tag_filter_enabled:
              createCheckoutDto.is_product_tag_filter_enabled,
            product_tag_filter_all: createCheckoutDto.product_tag_filter_all,
            product_tag_filter_any: createCheckoutDto.product_tag_filter_any,
            product_tag_filter_none: createCheckoutDto.product_tag_filter_none,
            is_customer_tag_filter_enabled:
              createCheckoutDto.is_customer_tag_filter_enabled,
            customer_tag_filter_all: createCheckoutDto.customer_tag_filter_all,
            customer_tag_filter_any: createCheckoutDto.customer_tag_filter_any,
            customer_tag_filter_none:
              createCheckoutDto.customer_tag_filter_none,
            is_discount_code_filter_enabled:
              createCheckoutDto.is_discount_code_filter_enabled,
            discount_code_filter_any:
              createCheckoutDto.discount_code_filter_any,
            discount_code_filter_none:
              createCheckoutDto.discount_code_filter_none,
            is_payment_gateway_filter_enabled:
              createCheckoutDto.is_payment_gateway_filter_enabled,
            payment_gateway_filter_any:
              createCheckoutDto.payment_gateway_filter_any,
            payment_gateway_filter_none:
              createCheckoutDto.payment_gateway_filter_none,
            is_payment_option_filter_enabled:
              createCheckoutDto.is_payment_option_filter_enabled,
            payment_options_type: createCheckoutDto.payment_options_type,
            send_to_unsub_customer: createCheckoutDto.send_to_unsub_customer,
            is_order_amount_filter_enabled:
              createCheckoutDto.is_order_amount_filter_enabled,
            order_amount_filter_greater_or_equal:
              createCheckoutDto.order_amount_filter_greater_or_equal,
            order_amount_filter_less_or_equal:
              createCheckoutDto.order_amount_filter_less_or_equal,
            order_amount_max: createCheckoutDto.order_amount_max,
            order_amount_min: createCheckoutDto.order_amount_min,
            is_discount_amount_filter_enabled:
              createCheckoutDto.is_discount_amount_filter_enabled,
            discount_amount_filter_greater_or_equal:
              createCheckoutDto.discount_amount_filter_greater_or_equal,
            discount_amount_filter_less_or_equal:
              createCheckoutDto.discount_amount_filter_less_or_equal,
            discount_amount_max: createCheckoutDto.discount_amount_max,
            discount_amount_min: createCheckoutDto.discount_amount_min,
            is_order_delivery_filter_enabled:
              createCheckoutDto.is_order_delivery_filter_enabled,
            order_method: createCheckoutDto.order_method,
          },
        },
      },
    });
    return createCheckoutCampaign;
  }

  async updateOrderCampaign(updateCampaignDto: any, req: any) {
    const user = req.user;
    console.log(user);

    const updateOrderCampaign = await this.databaseService.campaign.create({
      data: {
        name: updateCampaignDto.name,
        type: 'ORDER_UPDATED',
        creator: { connect: { id: user.id } },
        createdFor: { connect: { id: user.business.id } },
        OrderCreatedCampaign: {
          create: {
            template_name: updateCampaignDto.template_name,
            template_lang: updateCampaignDto.template_lang,
            template_type: updateCampaignDto.template_type,
            components: updateCampaignDto.components,
            trigger_type: updateCampaignDto.trigger_type,
            trigger_time: updateCampaignDto.trigger_time,
            filter_condition_match: updateCampaignDto.filter_condition_match,
            new_checkout_abandonment_filter:
              updateCampaignDto.new_checkout_abandonment_filter,
            new_checkout_abandonment_type:
              updateCampaignDto.new_checkout_abandonment_type,
            new_checkout_abandonment_time:
              updateCampaignDto.new_checkout_abandonment_time,
            new_order_creation_filter:
              updateCampaignDto.new_order_creation_filter,
            new_order_creation_type: updateCampaignDto.new_order_creation_type,
            new_order_creation_time: updateCampaignDto.new_order_creation_time,
            related_order_created: updateCampaignDto.related_order_created,
            related_order_fullfilled:
              updateCampaignDto.related_order_fullfilled,
          },
        },
        Filter: {
          create: {
            is_order_tag_filter_enabled:
              updateCampaignDto.filter.is_order_tag_filter_enabled,
            order_tag_filer_all: updateCampaignDto.filter.order_tag_filer_all,
            order_tag_filter_any: updateCampaignDto.filter.order_tag_filter_any,
            order_tag_filter_none:
              updateCampaignDto.filter.order_tag_filter_none,
            is_product_tag_filter_enabled:
              updateCampaignDto.filter.is_product_tag_filter_enabled,
            product_tag_filter_all:
              updateCampaignDto.filter.product_tag_filter_all,
            product_tag_filter_any:
              updateCampaignDto.filter.product_tag_filter_any,
            product_tag_filter_none:
              updateCampaignDto.filter.product_tag_filter_none,
            is_customer_tag_filter_enabled:
              updateCampaignDto.filter.is_customer_tag_filter_enabled,
            customer_tag_filter_all:
              updateCampaignDto.filter.customer_tag_filter_all,
            customer_tag_filter_any:
              updateCampaignDto.filter.customer_tag_filter_any,
            customer_tag_filter_none:
              updateCampaignDto.filter.customer_tag_filter_none,
            is_discount_code_filter_enabled:
              updateCampaignDto.filter.is_discount_code_filter_enabled,
            discount_code_filter_any:
              updateCampaignDto.filter.discount_code_filter_any,
            discount_code_filter_none:
              updateCampaignDto.filter.discount_code_filter_none,
            is_payment_gateway_filter_enabled:
              updateCampaignDto.filter.is_payment_gateway_filter_enabled,
            payment_gateway_filter_any:
              updateCampaignDto.filter.payment_gateway_filter_any,
            payment_gateway_filter_none:
              updateCampaignDto.filter.payment_gateway_filter_none,
            is_payment_option_filter_enabled:
              updateCampaignDto.filter.is_payment_option_filter_enabled,
            payment_options_type: updateCampaignDto.filter.payment_options_type,
            send_to_unsub_customer: updateCampaignDto.send_to_unsub_customer,
            is_order_amount_filter_enabled:
              updateCampaignDto.filter.is_order_amount_filter_enabled,
            order_amount_filter_greater_or_equal:
              updateCampaignDto.filter.order_amount_filter_greater_or_equal,
            order_amount_filter_less_or_equal:
              updateCampaignDto.filter.order_amount_filter_less_or_equal,
            order_amount_max: updateCampaignDto.filter.order_amount_max,
            order_amount_min: updateCampaignDto.filter.order_amount_min,
            is_discount_amount_filter_enabled:
              updateCampaignDto.filter.is_discount_amount,
            discount_amount_filter_greater_or_equal:
              updateCampaignDto.filter.discount_amount_filter_greater_or_equal,
            discount_amount_filter_less_or_equal:
              updateCampaignDto.filter.discount_amount_filter_less_or_equal,
            discount_amount_max: updateCampaignDto.filter.discount_amount_max,
            discount_amount_min: updateCampaignDto.filter.discount_amount_min,
            is_order_delivery_filter_enabled:
              updateCampaignDto.filter.is_order_delivery,
            order_method: updateCampaignDto.filter.order_method,
          },
        },
      },
    });

    return updateOrderCampaign;
  }

  async fullfillmentEventCreateCampaign(
    fullfillmentEventCreateDto: any,
    req: any,
  ) {
    const user = req.user;
    console.log(user);

    const fullfillmentEventCreateCampaign =
      await this.databaseService.campaign.create({
        data: {
          name: fullfillmentEventCreateDto.name,
          type: 'FULFILLMENT_EVENT_CREATED',
          creator: { connect: { id: user.id } },
          createdFor: { connect: { id: user.business.id } },
          OrderCreatedCampaign: {
            create: {
              template_name: fullfillmentEventCreateDto.template_name,
              template_lang: fullfillmentEventCreateDto.template_lang,
              template_type: fullfillmentEventCreateDto.template_type,
              components: fullfillmentEventCreateDto.components,
              trigger_type: fullfillmentEventCreateDto.trigger_type,
              trigger_time: fullfillmentEventCreateDto.trigger_time,
              filter_condition_match:
                fullfillmentEventCreateDto.filter_condition_match,
              new_checkout_abandonment_filter:
                fullfillmentEventCreateDto.new_checkout_abandonment_filter,
              new_checkout_abandonment_type:
                fullfillmentEventCreateDto.new_checkout_abandonment_type,
              new_checkout_abandonment_time:
                fullfillmentEventCreateDto.new_checkout_abandonment_time,
              new_order_creation_filter:
                fullfillmentEventCreateDto.new_order_creation_filter,
              new_order_creation_type:
                fullfillmentEventCreateDto.new_order_creation_type,
              new_order_creation_time:
                fullfillmentEventCreateDto.new_order_creation_time,
              related_order_created:
                fullfillmentEventCreateDto.related_order_created,
              related_order_fullfilled:
                fullfillmentEventCreateDto.related_order_fullfilled,
            },
          },
          Filter: {
            create: {
              is_order_tag_filter_enabled:
                fullfillmentEventCreateDto.filter.is_order_tag_filter_enabled,
              order_tag_filer_all:
                fullfillmentEventCreateDto.filter.order_tag_filer_all,
              order_tag_filter_any:
                fullfillmentEventCreateDto.filter.order_tag_filter_any,
              order_tag_filter_none:
                fullfillmentEventCreateDto.filter.order_tag_filter_none,
              is_product_tag_filter_enabled:
                fullfillmentEventCreateDto.filter.is_product_tag_filter_enabled,
              product_tag_filter_all:
                fullfillmentEventCreateDto.filter.product_tag_filter_all,
              product_tag_filter_any:
                fullfillmentEventCreateDto.filter.product_tag_filter_any,
              product_tag_filter_none:
                fullfillmentEventCreateDto.filter.product_tag_filter_none,
              is_customer_tag_filter_enabled:
                fullfillmentEventCreateDto.filter
                  .is_customer_tag_filter_enabled,
              customer_tag_filter_all:
                fullfillmentEventCreateDto.filter.customer_tag_filter_all,
              customer_tag_filter_any:
                fullfillmentEventCreateDto.filter.customer_tag_filter_any,
              customer_tag_filter_none:
                fullfillmentEventCreateDto.filter.customer_tag_filter_none,
              is_discount_code_filter_enabled:
                fullfillmentEventCreateDto.filter
                  .is_discount_code_filter_enabled,
              discount_code_filter_any:
                fullfillmentEventCreateDto.filter.discount_code_filter_any,
              discount_code_filter_none:
                fullfillmentEventCreateDto.filter.discount_code_filter_none,
              is_payment_gateway_filter_enabled:
                fullfillmentEventCreateDto.filter
                  .is_payment_gateway_filter_enabled,
              payment_gateway_filter_any:
                fullfillmentEventCreateDto.filter.payment_gateway_filter_any,
              payment_gateway_filter_none:
                fullfillmentEventCreateDto.filter.payment_gateway_filter_none,
              is_payment_option_filter_enabled:
                fullfillmentEventCreateDto.filter
                  .is_payment_option_filter_enabled,
              payment_options_type:
                fullfillmentEventCreateDto.filter.payment_options_type,
              send_to_unsub_customer:
                fullfillmentEventCreateDto.send_to_unsub_customer,
              is_order_amount_filter_enabled:
                fullfillmentEventCreateDto.filter
                  .is_order_amount_filter_enabled,
              order_amount_filter_greater_or_equal:
                fullfillmentEventCreateDto.filter
                  .order_amount_filter_greater_or_equal,
              order_amount_filter_less_or_equal:
                fullfillmentEventCreateDto.filter
                  .order_amount_filter_less_or_equal,
              order_amount_max:
                fullfillmentEventCreateDto.filter.order_amount_max,
              order_amount_min:
                fullfillmentEventCreateDto.filter.order_amount_min,
              is_discount_amount_filter_enabled:
                fullfillmentEventCreateDto.filter.is_discount_amount,
              discount_amount_filter_greater_or_equal:
                fullfillmentEventCreateDto.filter
                  .discount_amount_filter_greater_or_equal,
              discount_amount_filter_less_or_equal:
                fullfillmentEventCreateDto.filter
                  .discount_amount_filter_less_or_equal,
              discount_amount_max:
                fullfillmentEventCreateDto.filter.discount_amount_max,
              discount_amount_min:
                fullfillmentEventCreateDto.filter.discount_amount_min,
              is_order_delivery_filter_enabled:
                fullfillmentEventCreateDto.filter.is_order_delivery,
              order_method: fullfillmentEventCreateDto.filter.order_method,
            },
          },
        },
      });

    return fullfillmentEventCreateCampaign;
  }

  async fullfillmentCreateCampaign(fullfillmentCreateDto: any, req: any) {
    const user = req.user;
    console.log(user);

    const fullfillmentCreateCampaign =
      await this.databaseService.campaign.create({
        data: {
          name: fullfillmentCreateDto.name,
          type: 'FULFILLMENT_CREATED',
          creator: { connect: { id: user.id } },
          createdFor: { connect: { id: user.business.id } },
          OrderCreatedCampaign: {
            create: {
              template_name: fullfillmentCreateDto.template_name,
              template_lang: fullfillmentCreateDto.template_lang,
              template_type: fullfillmentCreateDto.template_type,
              components: fullfillmentCreateDto.components,
              trigger_type: fullfillmentCreateDto.trigger_type,
              trigger_time: fullfillmentCreateDto.trigger_time,
              filter_condition_match:
                fullfillmentCreateDto.filter_condition_match,
              new_checkout_abandonment_filter:
                fullfillmentCreateDto.new_checkout_abandonment_filter,
              new_checkout_abandonment_type:
                fullfillmentCreateDto.new_checkout_abandonment_type,
              new_checkout_abandonment_time:
                fullfillmentCreateDto.new_checkout_abandonment_time,
              new_order_creation_filter:
                fullfillmentCreateDto.new_order_creation_filter,
              new_order_creation_type:
                fullfillmentCreateDto.new_order_creation_type,
              new_order_creation_time:
                fullfillmentCreateDto.new_order_creation_time,
              related_order_created:
                fullfillmentCreateDto.related_order_created,
              related_order_fullfilled:
                fullfillmentCreateDto.related_order_fullfilled,
            },
          },
          Filter: {
            create: {
              is_order_tag_filter_enabled:
                fullfillmentCreateDto.filter.is_order_tag_filter_enabled,
              order_tag_filer_all:
                fullfillmentCreateDto.filter.order_tag_filer_all,
              order_tag_filter_any:
                fullfillmentCreateDto.filter.order_tag_filter_any,
              order_tag_filter_none:
                fullfillmentCreateDto.filter.order_tag_filter_none,
              is_product_tag_filter_enabled:
                fullfillmentCreateDto.filter.is_product_tag_filter_enabled,
              product_tag_filter_all:
                fullfillmentCreateDto.filter.product_tag_filter_all,
              product_tag_filter_any:
                fullfillmentCreateDto.filter.product_tag_filter_any,
              product_tag_filter_none:
                fullfillmentCreateDto.filter.product_tag_filter_none,
              is_customer_tag_filter_enabled:
                fullfillmentCreateDto.filter.is_customer_tag_filter_enabled,
              customer_tag_filter_all:
                fullfillmentCreateDto.filter.customer_tag_filter_all,
              customer_tag_filter_any:
                fullfillmentCreateDto.filter.customer_tag_filter_any,
              customer_tag_filter_none:
                fullfillmentCreateDto.filter.customer_tag_filter_none,
              is_discount_code_filter_enabled:
                fullfillmentCreateDto.filter.is_discount_code_filter_enabled,
              discount_code_filter_any:
                fullfillmentCreateDto.filter.discount_code_filter_any,
              discount_code_filter_none:
                fullfillmentCreateDto.filter.discount_code_filter_none,
              is_payment_gateway_filter_enabled:
                fullfillmentCreateDto.filter.is_payment_gateway_filter_enabled,
              payment_gateway_filter_any:
                fullfillmentCreateDto.filter.payment_gateway_filter_any,
              payment_gateway_filter_none:
                fullfillmentCreateDto.filter.payment_gateway_filter_none,
              is_payment_option_filter_enabled:
                fullfillmentCreateDto.filter.is_payment_option_filter_enabled,
              payment_options_type:
                fullfillmentCreateDto.filter.payment_options_type,
              send_to_unsub_customer:
                fullfillmentCreateDto.send_to_unsub_customer,
              is_order_amount_filter_enabled:
                fullfillmentCreateDto.filter.is_order_amount_filter_enabled,
              order_amount_filter_greater_or_equal:
                fullfillmentCreateDto.filter
                  .order_amount_filter_greater_or_equal,
              order_amount_filter_less_or_equal:
                fullfillmentCreateDto.filter.order_amount_filter_less_or_equal,
              order_amount_max: fullfillmentCreateDto.filter.order_amount_max,
              order_amount_min: fullfillmentCreateDto.filter.order_amount_min,
              is_discount_amount_filter_enabled:
                fullfillmentCreateDto.filter.is_discount_amount,
              discount_amount_filter_greater_or_equal:
                fullfillmentCreateDto.filter
                  .discount_amount_filter_greater_or_equal,
              discount_amount_filter_less_or_equal:
                fullfillmentCreateDto.filter
                  .discount_amount_filter_less_or_equal,
              discount_amount_max:
                fullfillmentCreateDto.filter.discount_amount_max,
              discount_amount_min:
                fullfillmentCreateDto.filter.discount_amount_min,
              is_order_delivery_filter_enabled:
                fullfillmentCreateDto.filter.is_order_delivery,
              order_method: fullfillmentCreateDto.filter.order_method,
            },
          },
        },
      });

    return fullfillmentCreateCampaign;
  }

  async orderTagAdded(orderTagAddedDto: any, req: any) {
    const user = req.user;
    console.log(user);

    const orderTagAddedCampaign = await this.databaseService.campaign.create({
      data: {
        name: orderTagAddedDto.name,
        type: 'ORDER_TAG_ADDED',
        creator: { connect: { id: user.id } },
        createdFor: { connect: { id: user.business.id } },
        OrderCreatedCampaign: {
          create: {
            template_name: orderTagAddedDto.template_name,
            template_lang: orderTagAddedDto.template_lang,
            template_type: orderTagAddedDto.template_type,
            components: orderTagAddedDto.components,
            trigger_type: orderTagAddedDto.trigger_type,
            trigger_time: orderTagAddedDto.trigger_time,
            filter_condition_match: orderTagAddedDto.filter_condition_match,
            new_checkout_abandonment_filter:
              orderTagAddedDto.new_checkout_abandonment_filter,
            new_checkout_abandonment_type:
              orderTagAddedDto.new_checkout_abandonment_type,
            new_checkout_abandonment_time:
              orderTagAddedDto.new_checkout_abandonment_time,
            new_order_creation_filter:
              orderTagAddedDto.new_order_creation_filter,
            new_order_creation_type: orderTagAddedDto.new_order_creation_type,
            new_order_creation_time: orderTagAddedDto.new_order_creation_time,
            related_order_created: orderTagAddedDto.related_order_created,
            related_order_fullfilled: orderTagAddedDto.related_order_fullfilled,
          },
        },
        Filter: {
          create: {
            is_order_tag_filter_enabled:
              orderTagAddedDto.filter.is_order_tag_filter_enabled,
            order_tag_filer_all: orderTagAddedDto.filter.order_tag_filer_all,
            order_tag_filter_any: orderTagAddedDto.filter.order_tag_filter_any,
            order_tag_filter_none:
              orderTagAddedDto.filter.order_tag_filter_none,
            is_product_tag_filter_enabled:
              orderTagAddedDto.filter.is_product_tag_filter_enabled,
            product_tag_filter_all:
              orderTagAddedDto.filter.product_tag_filter_all,
            product_tag_filter_any:
              orderTagAddedDto.filter.product_tag_filter_any,
            product_tag_filter_none:
              orderTagAddedDto.filter.product_tag_filter_none,
            is_customer_tag_filter_enabled:
              orderTagAddedDto.filter.is_customer_tag_filter_enabled,
            customer_tag_filter_all:
              orderTagAddedDto.filter.customer_tag_filter_all,
            customer_tag_filter_any:
              orderTagAddedDto.filter.customer_tag_filter_any,
            customer_tag_filter_none:
              orderTagAddedDto.filter.customer_tag_filter_none,
            is_discount_code_filter_enabled:
              orderTagAddedDto.filter.is_discount_code_filter_enabled,
            discount_code_filter_any:
              orderTagAddedDto.filter.discount_code_filter_any,
            discount_code_filter_none:
              orderTagAddedDto.filter.discount_code_filter_none,
            is_payment_gateway_filter_enabled:
              orderTagAddedDto.filter.is_payment_gateway_filter_enabled,
            payment_gateway_filter_any:
              orderTagAddedDto.filter.payment_gateway_filter_any,
            payment_gateway_filter_none:
              orderTagAddedDto.filter.payment_gateway_filter_none,
            is_payment_option_filter_enabled:
              orderTagAddedDto.filter.is_payment_option_filter_enabled,
            payment_options_type: orderTagAddedDto.filter.payment_options_type,
            send_to_unsub_customer: orderTagAddedDto.send_to_unsub_customer,
            is_order_amount_filter_enabled:
              orderTagAddedDto.filter.is_order_amount_filter_enabled,
            order_amount_filter_greater_or_equal:
              orderTagAddedDto.filter.order_amount_filter_greater_or_equal,
            order_amount_filter_less_or_equal:
              orderTagAddedDto.filter.order_amount_filter_less_or_equal,
            order_amount_max: orderTagAddedDto.filter.order_amount_max,
            order_amount_min: orderTagAddedDto.filter.order_amount_min,
            is_discount_amount_filter_enabled:
              orderTagAddedDto.filter.is_discount_amount,
            discount_amount_filter_greater_or_equal:
              orderTagAddedDto.filter.discount_amount_filter_greater_or_equal,
            discount_amount_filter_less_or_equal:
              orderTagAddedDto.filter.discount_amount_filter_less_or_equal,
            discount_amount_max: orderTagAddedDto.filter.discount_amount_max,
            discount_amount_min: orderTagAddedDto.filter.discount_amount_min,
            is_order_delivery_filter_enabled:
              orderTagAddedDto.filter.is_order_delivery,
            order_method: orderTagAddedDto.filter.order_method,
          },
        },
      },
    });

    return orderTagAddedCampaign;
  }
}
