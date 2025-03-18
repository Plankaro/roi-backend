import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import {
  getShopifyConfig,
  getWhatsappConfig,
  sanitizePhoneNumber,
} from 'utils/usefulfunction';
import { ShopifyService } from 'src/shopify/shopify.service';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';
import { Campaign } from '@prisma/client';


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
      const checkout = await this.databaseService.checkout.findUnique({
        where: { id: checkoutId },
        
      });
      const campaign = await this.databaseService.campaign.findUnique({
        where: { id: campaignId },
        include: {
          createdFor: true,
          creator: true,
          CheckoutCreatedCampaign: true,
        },
      });
      const customer = checkout.customer as any;
      const customer_id = `gid://shopify/Customer/${customer.id}`;

      const shopifyConfig = await getShopifyConfig(campaign.createdFor);

      const discount = await this.getShopifyPercentageDiscount(
        '15',
        customer_id,
        shopifyConfig,
      );
      console.log(discount);

      if (campaign?.CheckoutCreatedCampaign?.isdiscountgiven) {
      }

      // console.log(JSON.stringify(checkOutData, null, 2));
      // console.log('Campaign ID:', id);

      const abandoned_checkout_url = checkout.abandonedCheckoutUrl;
      const separator = abandoned_checkout_url.includes('?') ? '&' : '?';
      const discountedUrl = `${abandoned_checkout_url}${separator}discount=${discount}`;
      console.log(discountedUrl);

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
}
