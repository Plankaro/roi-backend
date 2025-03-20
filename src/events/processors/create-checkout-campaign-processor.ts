import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, tryCatch } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import {
  getFromDate,
  getShopifyConfig,
  getWhatsappConfig,
  sanitizePhoneNumber,
} from 'utils/usefulfunction';
import { ShopifyService } from 'src/shopify/shopify.service';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';
import { Campaign } from '@prisma/client';
import {
  getTagsArray,
  anyTagPresent,
  allTagsPresent,
  noneTagPresent,
} from 'utils/usefulfunction';
import { Order } from 'src/orders/entities/order.entity';

@Processor('createCheckoutCampaign')
@Injectable()
export class CreateCheckoutCampaign extends WorkerHost {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly shopifyService: ShopifyService,
    private readonly whatsaapService: WhatsappService,
  ) {
    super();
  }

  async process(job: Job<any>): Promise<void> {
    try {
      console.log('==== PROCESSING JOB ====');

      const { checkoutId, campaignId } = job.data;
      const [checkout, campaign] = await this.databaseService.$transaction([
        this.databaseService.checkout.findUnique({
          where: { id: checkoutId },
        }),
        this.databaseService.campaign.findUnique({
          where: { id: campaignId },
          include: {
            createdFor: true,
            creator: true,
            Filter: true,
            CheckoutCreatedCampaign: true,
          },
        }),
      ]);

      if (
        campaign?.CheckoutCreatedCampaign?.related_order_created &&
        checkout.completedAt !== null
      )
        return null;

      const order = await this.databaseService.order.findUnique({
        where: { checkout_id: checkout.shopify_id },
      });

      //get order
      if (campaign?.CheckoutCreatedCampaign.filter_condition_match) {
        if (order?.tags && campaign.Filter.is_order_tag_filter_enabled) {
          const tagsfromField = getTagsArray(order?.tags);
          if (campaign.Filter.order_tag_filer_all.length > 0) {
            if (
              !allTagsPresent(
                tagsfromField,
                campaign.Filter.order_tag_filer_all,
              )
            )
              return;
          }
          if (campaign.Filter.order_tag_filter_any.length > 0) {
            if (
              !anyTagPresent(
                tagsfromField,
                campaign.Filter.order_tag_filter_any,
              )
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
        const customer = checkout.customer as any;
        const getCustomerById = await this.getCustomerById(
          customer?.id?.toString(),
          shopifyConfig,
        );
        //customer filter
        if (campaign.Filter.is_customer_tag_filter_enabled) {
          const tagsfromField = getTagsArray(getCustomerById?.tags);
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

        const products = checkout.lineItems as any;
        const ProductList = await this.getProductsByIdArray(
          products,
          shopifyConfig,
        );
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
          const discount_code = checkout.discountCodes as any;
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
            !campaign.Filter.discount_code_filter_any.includes(checkout.gateway)
          ) {
            return;
          }

          if (
            campaign.Filter.discount_code_filter_none.length > 0 &&
            campaign.Filter.discount_code_filter_none.includes(checkout.gateway)
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
            customer.emailMarketingConsent.marketingState !== 'subscribed'
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
          checkout.discountCodes &&
          campaign.Filter.is_discount_amount_filter_enabled
        ) {
          const discountCodeArray = checkout.discountCodes as any;
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
          const orderCount = customer.OrderCount;
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

        await this.databaseService.checkoutOnCampaign.create({
          data: {
            checkoutId: checkout.id,
            campaignId: campaign.id,
          },
        });
      }

      if (
        campaign.CheckoutCreatedCampaign.new_checkout_abandonment_filter ===
        true
      ) {
        const abondnedcartdate = getFromDate(
          campaign.CheckoutCreatedCampaign.new_checkout_abandonment_type ===
            'BETWEEN_TRIGGER_TO_EVENT'
            ? campaign.CheckoutCreatedCampaign.trigger_time
            : (campaign.CheckoutCreatedCampaign.trigger_time ?? '0'),
        );
        const abondned_checkout = await this.databaseService.checkout.findFirst(
          {
            where: {
              phone: checkout.phone,
           id: { not: checkout.id },
              completedAt: null,
              createdAt: { gt: abondnedcartdate },
            },
          },
        );
        if (abondned_checkout) {
          return;
        }
      }
      if (campaign.CheckoutCreatedCampaign.new_order_creation_filter === true) {
        const orderCreationDate = getFromDate(
          campaign.CheckoutCreatedCampaign.new_order_creation_type ===
            'BETWEEN_TRIGGER_TO_EVENT'
            ? campaign.CheckoutCreatedCampaign.trigger_time
            : (campaign.CheckoutCreatedCampaign.trigger_time ?? '0'),
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

      //SENDING LOGIC HERE

      //customer tags

      //filter
      // const customer = checkout.customer as any;
      // const customer_id = `gid://shopify/Customer/${customer.id}`;

      // const shopifyConfig = await getShopifyConfig(campaign.createdFor);

      // const discount = await this.getShopifyPercentageDiscount(
      //   '15',
      //   customer_id,
      //   shopifyConfig,
      // );
      // console.log(discount);

      // if (campaign?.CheckoutCreatedCampaign?.isdiscountgiven) {
      // }

      // // console.log(JSON.stringify(checkOutData, null, 2));
      // // console.log('Campaign ID:', id);

      // const abandoned_checkout_url = checkout.abandonedCheckoutUrl;
      // const separator = abandoned_checkout_url.includes('?') ? '&' : '?';
      // const discountedUrl = `${abandoned_checkout_url}${separator}discount=${discount}`;
      // console.log(discountedUrl);

      // if (campaign.CheckoutCreatedCampaign.new_checkout_abandonment) {
      //   const new_checkout_abandonment =
      //     await this.databaseService.checkout.findFirst({
      //       where: {
      //         phone: checkout.phone,
      //         id: { not: checkout.id },
      //         createdAt: new Date(
      //           campaign.CheckoutCreatedCampaign.new_checkout_abandonment_time,
      //         ), //for reference edit later
      //       },
      //     });
      //     if (new_checkout_abandonment) return
      // }

      // if(campaign.CheckoutCreatedCampaign.new_order_creation){
      //   const order = this.databaseService.order.findFirst({
      //     where:{
      //       created_at: new Date(campaign.CheckoutCreatedCampaign.new_order_creation_time)
      //     }
      //   })
      //   if(order){
      //     console.log('Order done');
      //     return;
      //   }
      // }
      // const findOrder = await this.databaseService.order.findUnique({
      //   where:{
      //     checkout_id:checkout.shopify_id
      //   }
      // })

      // if(campaign.CheckoutCreatedCampaign.order_created && findOrder){
      //   return
      // }

      // if(campaign.CheckoutCreatedCampaign.order_cancelled && findOrder.status==="cancelled"){
      //   return
      // }

      //message will trigger here

      // if (!id) {
      //   console.error('Job data is missing "id" field:');
      //   return;
      // }

      // if (!findCampaign) {
      //   console.error(`Campaign not found for ID: ${id}`);
      //   return;
      // }

      // console.log(`Processing campaign ID: ${id}`);

      // const whatsappconfig = getWhatsappConfig(findCampaign.createdFor);

      // const findTemplate = await this.whatsaapService.findSpecificTemplate(
      //   whatsappconfig,
      //   // findCampaign.CheckoutCreatedCampaign.template_name,
      //   'campaign_test_order_create',
      // );

      // const shopifyConfig = await getShopifyConfig(findCampaign.createdFor);
      // // console.log(checkOutData.id);
      // // const checkoutId = await this.getCheckOut(checkOutData.id, shopifyConfig);
      // // console.log(checkoutId);

      // if (!findTemplate) {
      //   console.error(`WhatsApp template not found for campaign ID: ${id}`);
      //   return;
      // }

      // console.log(`Template found: ${findTemplate}`);

      // Continue with additional logic here...
      console.log('Additional processing logic goes here...');
    } catch (error) {
      console.error('WhatsApp API Error:', error);
    }
  }

  //   async getCheckOut(id: string, shopifyConfig: any) {
  //     try {
  //       const query = `
  //         query GetAbandonedCheckout($abandonedCheckoutId: ID!) {
  //  abandonmentByAbandonedCheckoutId(abandonedCheckoutId:$abandonedCheckoutId ) {
  //     abandonedCheckoutPayload {
  //       abandonedCheckoutUrl
  //       completedAt
  //       createdAt
  //       customer {
  //         createdAt
  //         email
  //         displayName
  //         firstName
  //         id
  //         lastName
  //       }
  //       lineItems {
  //         nodes {
  //           image {
  //             src
  //           }
  //           originalUnitPriceSet {
  //             shopMoney {
  //               amount
  //               currencyCode
  //             }
  //             presentmentMoney {
  //               amount
  //               currencyCode
  //             }
  //           }
  //           title
  //           variantTitle
  //         }
  //       }
  //     }
  //   }
  // }

  //         `;

  //       const test = `
  //   query GetAbandonedCheckouts {
  //     abandonedCheckouts(first: 250) {
  //       nodes {
  //         id
  //         abandonedCheckoutUrl
  //       }
  //     }
  //   }
  // `;

  //       const globalId = `gid://shopify/AbandonedCheckout/${id}`;
  //       console.log(globalId);

  //       const variables = { abandonedCheckoutId: globalId };

  //       const result = await this.shopifyService.executeGraphQL(
  //         test,
  //         {},
  //         shopifyConfig,
  //       );
  //       console.log(JSON.stringify(result, null, 2));
  //       return result;
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   }

  async getShopifyPercentageDiscount(
    percentage: string,
    customer_id: string,
    config: any,
  ) {
    // GraphQL mutation for creating a percentage discount code
    const mutation = `
    mutation CreatePercentageDiscount($basicCodeDiscount: DiscountCodeBasicInput!) {
      discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
        codeDiscountNode {
          codeDiscount {
            ... on DiscountCodeBasic {
              endsAt
              recurringCycleLimit
             
              createdAt
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

    // Generate a discount code, e.g. "PERCENT10" for a 10% discount
    const discountCode = `PERCENT${percentage}-${Date.now()}`;

    // Set start date to now and end date to one month from now
    const startsAt = new Date().toISOString();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    const endsAt = endDate.toISOString();

    // Convert the percentage to a value between 0.0 and 1.0
    const discountValue = parseFloat(percentage) / 100;

    // Prepare the variables for the mutation, including the corrected customerSelection
    const variables = {
      basicCodeDiscount: {
        title: `Percentage Discount of ${percentage}%`, // Provide a title
        code: discountCode,
        startsAt: startsAt,
        endsAt: endsAt,
        combinesWith: {
          orderDiscounts: true,
          productDiscounts: true,
          shippingDiscounts: true,
        },
        customerGets: {
          items: { all: true }, // Set the discount to apply to all items
          value: {
            percentage: discountValue,
          },
        },
        customerSelection: {
          customers: {
            add: [customer_id], // Provide pagination (first or last)
          },
        },
      },
    };

    try {
      // Send the GraphQL request to Shopify Admin API using your service method
      const response = await this.shopifyService.executeGraphQL(
        mutation,
        variables,
        config,
      );

      console.log(JSON.stringify(response, null, 2));
      return discountCode;
    } catch (error) {
      console.error('Error in getShopifyPercentageDiscount:', error);
      throw error;
    }
  }
  async getCustomerById(customerId: String, config: any) {
    try {
      const query = `
  query getCustomer($id: ID!) {
    customer(id: $id) {
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
  }
`;

      const variables = { id: `gid://shopify/Customer/${customerId}` };

      const response = await this.shopifyService.executeGraphQL(
        query,
        variables,
        config,
      );
      return response.customer;
    } catch (error) {
      console.error('Error in getCustomerById:', error);
    }
  }
  async getProductsByIdArray(
    products: { product_id: string }[],
    config: any,
  ): Promise<any[]> {
    // GraphQL query to fetch product details, including images.
    const query = `
      query ($id: ID!) {
        product(id: $id) {
          id
          title
          descriptionHtml
          vendor
          tags
          variants(first: 10) {
            nodes {
              id
              title
              priceV2 {
                amount
                currencyCode
              }
            }
          }
          images(first: 5) {
            edges {
              node {
                id
                altText
                url
              }
            }
          }
        }
      }
    `;

    try {
      // Execute the query concurrently for each product in the array.
      const responses = await Promise.all(
        products.map((product) => {
          const variables = {
            id: `gid://shopify/Product/${product.product_id}`,
          };
          return this.shopifyService.executeGraphQL(query, variables, config);
        }),
      );

      // Process the responses to extract the product and transform the images field.
      return responses.map((response) => {
        const product = response.product;
        if (product?.images?.edges) {
          // Map the nested image structure to an array of URLs.
          product.images = product.images.edges.map(
            (edge: any) => edge.node.url,
          );
        } else {
          product.images = [];
        }
        return product;
      });
    } catch (error) {
      console.error('Error in getProductsByIdArray:', error);
      throw error;
    }
  }
}
