import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job, tryCatch } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { discount_type } from '@prisma/client';
import {
  getFromDate,
  getShopifyConfig,
  getWhatsappConfig,
  sanitizePhoneNumber,
} from 'utils/usefulfunction';
import { ShopifyService } from 'src/shopify/shopify.service';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';
import { escapeRegExp } from 'utils/usefulfunction';

import {
  getTagsArray,
  anyTagPresent,
  allTagsPresent,
  noneTagPresent,
} from 'utils/usefulfunction';
import { Order } from 'src/orders/entities/order.entity';
import { Campaign } from 'src/campaign/entities/campaign.entity';
import { add } from 'date-fns';

@Processor('createCheckoutCampaign')
@Injectable()
export class CreateCheckoutCampaign extends WorkerHost {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly shopifyService: ShopifyService,
    private readonly whatsappService: WhatsappService,
  ) {
    super();
  }

  async process(job: Job<any>): Promise<void> {
    try {
      console.log('==== PROCESSING JOB ====', job.data);

      const { checkoutId, campaignId } = job.data;
      console.log('Fetching checkout and campaign:', {
        checkoutId,
        campaignId,
      });

      const [checkout, campaign] = await this.databaseService.$transaction([
        this.databaseService.checkout.findUnique({
          where: { id: checkoutId },
        }),
        this.databaseService.campaign.findUnique({
          where: { id: campaignId },
          include: {
            User: true,
            Business: true,
            filters: true,
          },
        }),
      ]);

      console.log('Fetched checkout:', checkout);
      console.log('Fetched campaign:', campaign);

      if (
        campaign?.related_order_created &&
        checkout.completedAt !== null
      )
        return null;

      const order = await this.databaseService.order.findUnique({
        where: { checkout_id: checkout.shopify_id },
      });

      //get order
   
        if (order?.tags && campaign.filters.is_order_tag_filter_enabled) {
          const tagsfromField = getTagsArray(order?.tags);
          if (campaign.filters.order_tag_filter_all.length > 0) {
            if (
              !allTagsPresent(
                tagsfromField,
                campaign.filters.order_tag_filter_all,
              )
            )
              return;
          }
          if (campaign.filters.order_tag_filter_any.length > 0) {
            if (
              !anyTagPresent(
                tagsfromField,
                campaign.filters.order_tag_filter_any,
              )
            )
              return;
          }
          if (campaign.filters.order_tag_filter_none.length > 0) {
            if (
              !noneTagPresent(
                tagsfromField,
                campaign.filters.order_tag_filter_none,
              )
            )
              return;
          }
        }
        const shopifyConfig = getShopifyConfig(campaign.Business);
        const customer = checkout.customer as any;
        const getCustomerById = await this.getCustomerById(
          customer?.id?.toString(),
          shopifyConfig,
        );
        //customer filter
        if (campaign.filters.is_customer_tag_filter_enabled) {
          const tagsfromField = getTagsArray(getCustomerById?.tags);
          if (campaign.filters.customer_tag_filter_all.length > 0) {
            if (
              !allTagsPresent(
                tagsfromField,
                campaign.filters.customer_tag_filter_all,
              )
            )
              return;
          }
          if (campaign.filters.customer_tag_filter_any.length > 0) {
            if (
              !anyTagPresent(
                tagsfromField,
                campaign.filters.customer_tag_filter_any,
              )
            )
              return;
          }
          if (campaign.filters.customer_tag_filter_none.length > 0) {
            if (
              !noneTagPresent(
                tagsfromField,
                campaign.filters.customer_tag_filter_none,
              )
            )
            console.log(noneTagPresent(
              tagsfromField,
              campaign.filters.customer_tag_filter_none,
            ));
              return;
          }
        }
        //ProductTags

        const products = checkout.lineItems as any;
        const ProductList = await this.getProductsByIdArray(
          products,
          shopifyConfig,
        );
        if (ProductList && campaign.filters.is_product_tag_filter_enabled) {
          const tagsFromField = getTagsArray(
            ProductList?.map((products) => products.tags),
          );
          if (campaign.filters.product_tag_filter_all.length > 0) {
            if (
              !allTagsPresent(
                tagsFromField,
                campaign.filters.product_tag_filter_all,
              )
            )
              return;
          }
          if (campaign.filters.product_tag_filter_any.length > 0) {
            if (
              !anyTagPresent(
                tagsFromField,
                campaign.filters.product_tag_filter_any,
              )
            )
              return;
          }
          if (campaign.filters.product_tag_filter_none.length > 0) {
            if (
              !noneTagPresent(
                tagsFromField,
                campaign.filters.product_tag_filter_none,
              )
            )
              return;
          }
        }
        //discount_code
        if (campaign.filters.is_discount_code_filter_enabled) {
          const discount_code = checkout.discountCodes as any;
          const discountCodeArray = discount_code?.map((code) => code.code);
          if (
            campaign.filters.discount_code_filter_any.length > 0 &&
            !campaign.filters.discount_code_filter_any.some((tag) =>
              discountCodeArray.includes(tag),
            )
          ) {
            return;
          }
          if (
            campaign.filters.discount_code_filter_none.length > 0 &&
            !campaign.filters.discount_code_filter_none.every((tag) =>
              discountCodeArray.includes(tag),
            )
          ) {
            return;
          }
        }

        if (campaign.filters.is_payment_gateway_filter_enabled) {
          if (
            campaign.filters.discount_code_filter_any.length > 0 &&
            !campaign.filters.discount_code_filter_any.includes(checkout.gateway)
          ) {
            return;
          }

          if (
            campaign.filters.discount_code_filter_none.length > 0 &&
            campaign.filters.discount_code_filter_none.includes(checkout.gateway)
          ) {
            return;
          }
        }
        //resolving tags\
        if (
          campaign.filters.is_payment_option_filter_enabled &&
          order?.status &&
          campaign.filters.payment_options_type !== order.status
        ) {
          return;
        }
        if (campaign.filters.is_send_to_unsub_customer_filter_enabled) {
          if (
            campaign.filters.send_to_unsub_customer == false &&
            customer.emailMarketingConsent.marketingState !== 'subscribed'
          ) {
            return;
          }
        }

        if (campaign.filters.is_order_amount_filter_enabled) {
          const orderAmount = Number(order.amount);

          const {
            order_amount_filter_greater_or_equal: minAmount,
            order_amount_filter_less_or_equal: maxAmount,
            order_amount_min: rangeMin,
            order_amount_max: rangeMax,
          } = campaign.filters;

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
          campaign.filters.is_discount_amount_filter_enabled
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
          } = campaign.filters;
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
        if (campaign.filters.is_order_count_filter_enabled) {
          const orderCount = customer.OrderCount;
          const {
            order_count_greater_or_equal: minAmount,
            order_count_less_or_equal: maxAmount,
            order_count_min: rangeMin,
            order_count_max: rangeMax,
          } = campaign.filters;
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

      

      // Abandoned Checkout Logic
      if (campaign.new_checkout_abandonment_filter === true) {
        const trigger_time = campaign.new_checkout_abandonment_time as any;
        const abandonedCartDate = getFromDate(
          campaign.new_checkout_abandonment_type === 'AFTER_EVENT'
            ? '0 minutes'
            : `${trigger_time.time} ${trigger_time.unit}`,
        );
        console.log(
          'Checking for abandoned checkouts since:',
          abandonedCartDate,
        );

        const abandoned_checkout =
          await this.databaseService.checkout.findFirst({
            where: {
              phone: checkout.phone,
              id: { not: checkout.id },
              completedAt: null,
              createdAt: { gt: abandonedCartDate },
            },
          });
        if (abandoned_checkout) {
          console.log('Abandoned checkout found. Exiting.');
          return;
        }
      }
      console.log(campaign.components);

      console.log('All filters passed. Proceeding to message sending logic...');
      await this.databaseService.checkoutOnCampaign.create({
        data: {
          checkoutId: checkout.id,
          campaignId: campaign.id,
        },
      });

      const components = [];
      const { header, buttons, body } = campaign.components as any;
      console.log('Component Data:', { header, buttons, body });

      const config = getWhatsappConfig(campaign.Business);
      const response = await this.whatsappService.findSpecificTemplate(
        config,
        campaign.template_name,
      );
      const template = response?.data?.[0];
      console.log('Template Data:', template); // Ensure safe access

      const customerId = checkout.customer as any;
      let discount;
      if (campaign.is_discount_given) {
        discount = await this.getShopifyDiscount(
          campaign.discount_type,
          String(campaign.discount),
          customerId.id.toString(),
          shopifyConfig,
        );
      }
      console.log('Discount Data:', discount);
      // // Process header component
      if (header && header.isEditable) {
        let headerValue = '';
        if (header.type === 'TEXT') {
          headerValue = header.fromsegment
            ? this.getCheckoutValue(checkout, header.segmentname, discount)
            : header.value;
          if (
            template.parameter_format === 'NAMED' &&
            template.components[0]?.example?.header_text_named_params?.[0]
              ?.param_name
          ) {
            components.push({
              type: 'header',
              parameters: [
                {
                  type: 'text',
                  parameter_name:
                    template.components[0].example.header_text_named_params[0]
                      .param_name,
                  text: headerValue,
                },
              ],
            });
          } else {
            components.push({
              type: 'header',
              parameters: [{ type: 'text', text: headerValue }],
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
            parameters: [
              { type: 'document', document: { link: header.value } },
            ],
          });
        }
        console.log('Header processed with value:', headerValue);
      }

      // Process body component parameters
      const bodyParameters = body.map((param) => {
        const value = param.fromsegment
          ? this.getCheckoutValue(checkout, param.segmentname, discount)
          : param.value || 'test';
        return template.parameter_format === 'NAMED'
          ? {
              type: 'text',
              parameter_name: param.parameter_name.replace(/{{|}}/g, ''),
              text: value,
            }
          : { type: 'text', text: value };
      });
      components.push({ type: 'body', parameters: bodyParameters });
      console.log('Body parameters processed:', bodyParameters);

      // Process buttons
      buttons.forEach((button, index) => {
        if (button.type === 'URL' && button.isEditable === true) {
          components.push({
            type: 'button',
            sub_type: 'url',
            index: index,
            parameters: [
              {
                type: 'text',
                text: button.fromsegment
                  ? this.getCheckoutValue(
                      checkout,
                      button.segmentname,
                      discount,
                    )
                  : button.value,
              },
            ],
          });
        } else if (button.type === 'COPY_CODE') {
          components.push({
            type: 'button',
            sub_type: 'COPY_CODE',
            index: button.index,
            parameters: [
              {
                type: 'coupon_code', // Must be exactly "coupon_code" for copy_code buttons
                coupon_code: '', // The actual coupon code text you want to be copied
              },
            ],
          });
        }
      });
      console.log('Buttons processed:', JSON.stringify(components, null, 2));

      const messageResponse = await this.whatsappService.sendTemplateMessage(
        {
          recipientNo: checkout.phone,
          templateName: template.name,
          languageCode: template.language,
          components,
        },
        config,
      );

      console.log(JSON.stringify(messageResponse, null, 2));

      const footer = template.components.find(
        (component) => component.type === 'footer'
      );
      let bodycomponent = template.components.find(
        (component) => component.type.toLowerCase() === 'body'
      );
      console.log('Body component found:', bodycomponent);
      
      let bodyRawText = '';
      if (bodycomponent && bodycomponent.text) {
        bodyRawText = bodycomponent.text;
        console.log('Original bodyRawText:', bodyRawText);
      
        // Build a mapping for placeholders from the body parameters
        const mapping = body.reduce(
          (acc, param) => {
            // Clean up parameter name (remove any curly braces if present)
            const key = param.parameter_name.replace(/{{|}}/g, '');
            // Use getCheckoutValue if the value should come from checkout data; otherwise, fallback to param.value
            const value = param.fromsegment
              ? this.getCheckoutValue(checkout, param.segmentname, discount)
              : param.value;
            acc[key] = value;
            console.log(`Mapping key: "${key}" with value:`, value);
            return acc;
          },
          {} as Record<string, string | number | null>
        );
      
        console.log('Mapping for body text:', mapping);
      
        // Replace each placeholder in the bodyRawText with its mapped value
        Object.keys(mapping).forEach((placeholder) => {
          const escapedPlaceholder = escapeRegExp(placeholder);
          // Create a regex pattern to match the placeholder wrapped in curly braces,
          // with optional whitespace inside the braces.
          const regex = new RegExp(`{{\\s*${escapedPlaceholder}\\s*}}`, 'g');
          console.log(
            `Replacing all occurrences of placeholder "{{${placeholder}}}" using regex:`,
            regex
          );
          bodyRawText = bodyRawText.replace(
            regex,
            mapping[placeholder] as string
          );
          console.log(
            `Updated bodyRawText after replacing "${placeholder}":`,
            bodyRawText
          );
        });
      
        // Remove any remaining curly braces in case some placeholders weren't replaced
        bodyRawText = bodyRawText.replace(/{{|}}/g, '');
        console.log('Final bodyRawText after removing curly braces:', bodyRawText);
      }

      const prospect = await this.databaseService.prospect.upsert({
        where:{
          phoneNo: sanitizePhoneNumber(checkout.phone),
        },
        update:{},
        create:{
          phoneNo: sanitizePhoneNumber(checkout.phone),
          name: checkout.name,
          email: checkout.email,

          lead: 'LEAD',
          buisnessNo: campaign.Business.whatsapp_mobile
        }
      })

      // Save chat record to the database
      // console.log('Creating chat record in DB for contact:', contact);
      const addTodb = await this.databaseService.chat.create({
        data: {
          prospectId: prospect.id,
          template_used: true,
          template_name: campaign.template_name,
          senderPhoneNo: campaign.Business.whatsapp_mobile,
          receiverPhoneNo: sanitizePhoneNumber(checkout.phone),
          sendDate: new Date(),
          header_type: header?.type,
          header_value:
            header?.isEditable && header?.type === 'TEXT'
              ? this.getCheckoutValue(checkout, header.segmentname, discount)
              : header?.value,
          body_text: bodyRawText,
          footer_included: footer ? true : false,
          footer_text: footer?.text || '',
          Buttons: buttons,
          type: template.type || 'text',
          template_components: components,
          isForCampaign: true,
          campaignId: campaign.id,
          
        },
      });
      console.log(addTodb)
    } catch (error) {
      console.error('Error in getShopifyPercentageDiscount:', error);
      throw error;
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

  async getShopifyDiscount(
    type: discount_type,
    value: string,
    customer_id: string,
    config: any,
  ) {
    // GraphQL mutation for creating a discount code
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

    // Generate a discount code
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);

    // Format the current timestamp by removing special characters
    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '');

    // Build the discount code using a generic "DISC" prefix
    const discountCode = `DISC${value}-${timestamp}-${randomSuffix}`;

    // Set start date to now and end date to one month from now
    const startsAt = new Date().toISOString();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    const endsAt = endDate.toISOString();

    // Define the discount value based on the type
    let discountValue: number;
    let valueObject: any;
    if (type === discount_type.PERCENTAGE) {
      discountValue = parseFloat(value) / 100;
      valueObject = {
        percentage: discountValue,
      };
    } else if (type === discount_type.AMOUNT) {
      discountValue = parseFloat(value);
      valueObject = {
        discountAmount: { amount: discountValue, appliesOnEachItem: false }, // Adjust the currency if needed
      };
    } else {
      throw new Error('Invalid discount type');
    }
    const shopifyCustomerId = `gid://shopify/Customer/${customer_id}`;
    // Prepare the variables for the mutation

    const variables = {
      basicCodeDiscount: {
        title:
          type === discount_type.PERCENTAGE
            ? `Percentage Discount of ${value}%`
            : `Amount Discount of $${value}`,
        code: discountCode,
        startsAt,
        endsAt,
        combinesWith: {
          orderDiscounts: true,
          productDiscounts: true,
          shippingDiscounts: true,
        },
        customerGets: {
          items: { all: true },
          value: valueObject,
        },
        customerSelection: {
          customers: {
            add: [shopifyCustomerId],
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
      console.error('Error in getShopifyDiscount:', error);
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
  
      console.log(JSON.stringify(responses, null, 2)); // Log the responses
  
      // Process the responses to extract the product and transform the images field.
      return responses.map((response) => {
        // Extract the product from response.data.product
        const product = response?.data?.product;
        if (product) {
          if (product.images?.edges) {
            // Map the nested image structure to an array of URLs.
            product.images = product.images.edges.map(
              (edge: any) => edge.node.url,
            );
          } else {
            product.images = [];
          }
        }
        return product;
      });
    } catch (error) {
      console.error('Error in getProductsByIdArray:', error);
      throw error;
    }
  }
  
  getCheckoutValue(
    checkout: any,
    key: string,
    discount?: string,
  ): string | number | null {
    let abandonUrl = checkout.abandonedCheckoutUrl || null;

    // Remove the base Shopify URL if present using URL parsing
    if (abandonUrl && checkout.domain) {
      const baseUrl = `https://${checkout.domain}`;
      try {
        const parsedUrl = new URL(abandonUrl);
        const parsedBase = new URL(baseUrl);
        if (parsedUrl.origin === parsedBase.origin) {
          // Get relative path including query parameters
          abandonUrl = parsedUrl.pathname + parsedUrl.search;
        }
      } catch (error) {
        console.warn('Failed to parse URL:', error);
      }
    }
    console.error(discount);

    // Append discount as a query parameter if discount exists
    const modifiedAbandonUrl = abandonUrl
      ? discount
        ? `${abandonUrl}${abandonUrl.includes('?') ? '&' : '?'}discount=${discount}`
        : abandonUrl
      : null;

    console.log('modifiedAbandonUrl', modifiedAbandonUrl);

    const mapping: Record<string, any> = {
      customer_full_name:
        `${checkout.customer?.first_name || ''} ${checkout.customer?.last_name || ''}`.trim(),
      customer_address: checkout.customer?.default_address
        ? `${checkout.customer.default_address.address1}, ${checkout.customer.default_address.city}, ${checkout.customer.default_address.province}, ${checkout.customer.default_address.country}, ${checkout.customer.default_address.zip}`
        : null,
      customer_phone: checkout.customer?.phone || null,
      cart_total_items:
        checkout.lineItems?.reduce(
          (acc: number, item: any) => acc + item.quantity,
          0,
        ) || 0,
      cart_total_price: checkout.totalPrice || '0.00',
      cart_items: checkout.lineItems.map((item: any) => item.title).join(', '),
      discount_code: discount || null,
      discount_amount: checkout.totalDiscounts || '0.00',
      abandon_checkout_url: modifiedAbandonUrl,
      shop_url: checkout.domain ? `https://${checkout.domain}` : null,
    };

    return mapping.hasOwnProperty(key) ? mapping[key] : key;
  }



  // Example Usage:
  // Should print the abandoned checkout URL
}
