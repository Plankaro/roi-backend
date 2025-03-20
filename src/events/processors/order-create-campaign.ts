import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { ShopifyService } from 'src/shopify/shopify.service';
import { getShopifyConfig, sanitizePhoneNumber } from 'utils/usefulfunction';
import {
  getTagsArray,
  anyTagPresent,
  allTagsPresent,
  noneTagPresent,
  getFromDate
} from 'utils/usefulfunction';

@Injectable()
@Processor('createOrderCampaign')
export class CreateOrderCampaign extends WorkerHost {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly shopifyService: ShopifyService,
  ) {
    super();
  }
  async process(job: Job<any>): Promise<void> {
    const { campaignId, orderId } = job.data;
    // Process the order and campaign here
    const [order, campaign] = await this.databaseService.$transaction([
      this.databaseService.order.findUnique({
        where: { id: orderId },
      }),
      this.databaseService.campaign.findUnique({
        where: { id: campaignId },
        include: {
          createdFor: true,
          creator: true,
          Filter: true,
          OrderCreatedCampaign: true,
        },
      }),
    ]);
    const shopifyConfig = getShopifyConfig(campaign.createdFor);

    const orderfromshopify = await this.getOrderById(orderId, shopifyConfig);

    // Process the order and campaign here
    if (campaign?.OrderCreatedCampaign.filter_condition_match) {
      if (order?.tags && campaign.Filter.is_order_tag_filter_enabled) {
        const tagsfromField = getTagsArray(order?.tags);
        if (campaign.Filter.order_tag_filer_all.length > 0) {
          if (
            !allTagsPresent(tagsfromField, campaign.Filter.order_tag_filer_all)
          )
            return;
        }
        if (campaign.Filter.order_tag_filter_any.length > 0) {
          if (
            !anyTagPresent(tagsfromField, campaign.Filter.order_tag_filter_any)
          )
            return;
        }
        if (campaign.Filter.order_tag_filter_none.length > 0) {
          if (
            !noneTagPresent(
              tagsfromField,
              campaign.Filter.order_tag_filter_none,
            )
          )
            return;
        }
      }
      const shopifyConfig = getShopifyConfig(campaign.createdFor);

      const getCustomer = orderfromshopify.customer;
      //customer filter
      if (campaign.Filter.is_customer_tag_filter_enabled) {
        const tagsfromField = getTagsArray(getCustomer?.tags);
        if (campaign.Filter.customer_tag_filter_all.length > 0) {
          if (
            !allTagsPresent(
              tagsfromField,
              campaign.Filter.customer_tag_filter_all,
            )
          )
            return;
        }
        if (campaign.Filter.customer_tag_filter_any.length > 0) {
          if (
            !anyTagPresent(
              tagsfromField,
              campaign.Filter.customer_tag_filter_any,
            )
          )
            return;
        }
        if (campaign.Filter.customer_tag_filter_none.length > 0) {
          if (
            !noneTagPresent(
              tagsfromField,
              campaign.Filter.customer_tag_filter_none,
            )
          )
            return;
        }
      }
      //ProductTags

      const ProductList = orderfromshopify.lineItems as any;
      if (ProductList && campaign.Filter.is_product_tag_filter_enabled) {
        const tagsFromField = getTagsArray(
          ProductList?.map((products) => products.tags),
        );
        if (campaign.Filter.product_tag_filter_all.length > 0) {
          if (
            !allTagsPresent(
              tagsFromField,
              campaign.Filter.product_tag_filter_all,
            )
          )
            return;
        }
        if (campaign.Filter.product_tag_filter_any.length > 0) {
          if (
            !anyTagPresent(
              tagsFromField,
              campaign.Filter.product_tag_filter_any,
            )
          )
            return;
        }
        if (campaign.Filter.product_tag_filter_none.length > 0) {
          if (
            !noneTagPresent(
              tagsFromField,
              campaign.Filter.product_tag_filter_none,
            )
          )
            return;
        }
      }
      //discount_code
      if (campaign.Filter.is_discount_code_filter_enabled) {
        const discount_code = order.discount_codes as any;
        const discountCodeArray = discount_code?.map((code) => code.code);
        if (
          campaign.Filter.discount_code_filter_any.length > 0 &&
          !campaign.Filter.discount_code_filter_any.some((tag) =>
            discountCodeArray.includes(tag),
          )
        ) {
          return;
        }
        if (
          campaign.Filter.discount_code_filter_none.length > 0 &&
          !campaign.Filter.discount_code_filter_none.every((tag) =>
            discountCodeArray.includes(tag),
          )
        ) {
          return;
        }
      }

      if (campaign.Filter.is_payment_gateway_filter_enabled) {
        if (
          campaign.Filter.discount_code_filter_any.length > 0 &&
          !campaign.Filter.discount_code_filter_any.includes(
            orderfromshopify.paymentGatewayNames,
          )
        ) {
          return;
        }

        if (
          campaign.Filter.discount_code_filter_none.length > 0 &&
          campaign.Filter.discount_code_filter_none.includes(
            orderfromshopify.paymentGatewayNames,
          )
        ) {
          return;
        }
      }
      //resolving tags\
      if (
        campaign.Filter.is_payment_option_filter_enabled &&
        order?.status &&
        campaign.Filter.payment_options_type !== order.status
      ) {
        return;
      }
      if (campaign.Filter.is_send_to_unsub_customer_filter_enabled) {
        if (
          campaign.Filter.send_to_unsub_customer == false &&
          orderfromshopify.customer.emailMarketingConsent.marketingState !==
            'subscribed'
        ) {
          return;
        }
      }

      if (campaign.Filter.is_order_amount_filter_enabled) {
        const orderAmount = Number(order.amount);

        const {
          order_amount_filter_greater_or_equal: minAmount,
          order_amount_filter_less_or_equal: maxAmount,
          order_amount_min: rangeMin,
          order_amount_max: rangeMax,
        } = campaign.Filter;

        if (
          (minAmount && orderAmount < minAmount) ||
          (maxAmount !== 0 && orderAmount > maxAmount) ||
          orderAmount < rangeMin ||
          orderAmount > rangeMax
        ) {
          // Order amount is outside the specified range; handle accordingly
          return;
        }

        // Proceed with processing the order
      }

      if (
        order.discount_codes &&
        campaign.Filter.is_discount_amount_filter_enabled
      ) {
        const discountCodeArray = order.discount_codes as any;
        const discountAmount = discountCodeArray.reduce((acc, discount) => {
          return acc + parseFloat(discount.amount);
        }, 0);
        const {
          discount_amount_filter_greater_or_equal: minAmount,
          discount_amount_filter_less_or_equal: maxAmount,
          discount_amount_min: rangeMin,
          discount_amount_max: rangeMax,
        } = campaign.Filter;
        if (
          (minAmount && discountAmount < minAmount) ||
          (maxAmount !== 0 && discountAmount > maxAmount) ||
          discountAmount < rangeMin ||
          discountAmount > rangeMax
        ) {
          // Order amount is outside the specified range; handle accordingly
          return;
        }
      }
      // Proceed with processing the order
      if (campaign.Filter.is_order_count_filter_enabled) {
        const orderCount = orderfromshopify.customer.OrderCount;
        const {
          order_count_greater_or_equal: minAmount,
          order_count_less_or_equal: maxAmount,
          order_count_min: rangeMin,
          order_count_max: rangeMax,
        } = campaign.Filter;
        if (
          (minAmount && orderCount < minAmount) ||
          (maxAmount !== 0 && orderCount > maxAmount) ||
          orderCount < rangeMin ||
          orderCount > rangeMax
        ) {
          // Order amount is outside the specified range; handle accordingly
          return;
        }
      }
    }
       if (
            campaign.OrderCreatedCampaign.new_checkout_abandonment_filter ===
            true
          ) {
            const abondnedcartdate = getFromDate(
              campaign.OrderCreatedCampaign.new_checkout_abandonment_type ===
                'BETWEEN_TRIGGER_TO_EVENT'
                ? campaign.OrderCreatedCampaign.trigger_time
                : (campaign.OrderCreatedCampaign.new_checkout_abandonment_time ?? '0'),
            );
            const abondned_checkout = await this.databaseService.checkout.findFirst(
              {
                where: {
                  phone: order.customer_phoneno,
               id: { not: order.checkout_id },
                  completedAt: null,
                  createdAt: { gt: abondnedcartdate },
                },
              },
            );
            if (abondned_checkout) {
              return;
            }
          }
          if (campaign.OrderCreatedCampaign.new_order_creation_filter === true) {
            const orderCreationDate = getFromDate(
              campaign.OrderCreatedCampaign.new_order_creation_type ===
                'BETWEEN_TRIGGER_TO_EVENT'
                ? campaign.OrderCreatedCampaign.trigger_time
                : (campaign.OrderCreatedCampaign.new_order_creation_time ?? '0'),
            );
            const new_order = await this.databaseService.order.findFirst({
              where: {
                customer_phoneno:order.customer_phoneno,
                id: { not: order.id },
                created_at: { gt: orderCreationDate },
              },
            });
            if (new_order) {
              return;
            }
          }
  }
  async getOrderById(orderId: string, config: any) {
    try {
      const query = `
            query getOrder($id: ID!) {
              order(id: $id) {
                id
                name
                orderNumber
                email
                phone
                createdAt
                processedAt
                financialStatus
                fulfillmentStatus
                cancelReason
                cancelledAt
                totalPriceSet {
                  shopMoney {
                    amount
                    currencyCode
                  }
                }
                subtotalPriceSet {
                  shopMoney {
                    amount
                    currencyCode
                  }
                }
                totalTaxSet {
                  shopMoney {
                    amount
                    currencyCode
                  }
                }
                lineItems(first: 250) {
                  edges {
                    node {
                      title
                      tags
                      images(first: 250) {
                        edges {
                          node {
                            id
                            altText
                            url
                          }
                        }
                      }
                      quantity
                      priceSet {
                        shopMoney {
                          amount
                          currencyCode
                        }
                      }
                      variant {
                        id
                        title
                         image {
                                 url
                               }
                      }
                    }
                  }
                }
                customer {
                  id
                  firstName
                  lastName
                  displayName
                  email
                  numberOfOrders
                  phone
                  amountSpent {
                    amount
                    currencyCode
                  }
                  emailMarketingConsent {
                    marketingState
                    marketingOptInLevel
                    consentUpdatedAt
                  }
                  addresses {
                    address1
                    address2
                    city
                    country
                    zip
                  }
                  tags
                }
                shippingAddress {
                  address1
                  address2
                  city
                  country
                  zip
                }
              }
            }
          `;

      const variables = { id: `gid://shopify/Order/${orderId}` };

      const response = await this.shopifyService.executeGraphQL(
        query,
        variables,
        config,
      );

      if (!response?.order) {
        throw new Error('Order not found');
      }

      return {
        ...response.order,
        images: response.images.edges.map((edge: any) => edge.node),
        lineItems: response.order.lineItems.edges.map((edge: any) => edge.node),
      };
    } catch (error) {
      console.error('Error in getOrderById:', error);
      throw error;
    }
  }
}
