import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { ShopifyService } from 'src/shopify/shopify.service';
import { escapeRegExp, getRazorpayConfig, getShopifyConfig, getWhatsappConfig, sanitizePhoneNumber,isTemplateButtonRedirectSafe } from 'utils/usefulfunction';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';

import {
  getTagsArray,
  anyTagPresent,
  allTagsPresent,
  noneTagPresent,
  getFromDate
} from 'utils/usefulfunction';
import _ from 'lodash';
import { RazorpayService } from 'src/razorpay/razorpay.service';

@Injectable()
@Processor('updateOrderCampaign')
export class updateOrderCampaign extends WorkerHost {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly shopifyService: ShopifyService,
    private readonly whatsappService: WhatsappService,
    private readonly razorpayService: RazorpayService

  ) {
    super();
  }
   async process(job: Job<any>): Promise<void> {
      try {
        console.log('==== PROCESSING JOB ====', job.data);
  
        const { campaignId, orderId } = job.data;
  
        const [order, campaign] = await this.databaseService.$transaction([
          this.databaseService.order.findUnique({
            where: { id: orderId },
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
        const shopifyConfig = getShopifyConfig(campaign.Business);
        const whatsappConfig = getWhatsappConfig(campaign.Business);
        const razorpayConfig = getRazorpayConfig(campaign.Business);
  
        const orderById = await this.getOrderById(
          order.shopify_id,
          shopifyConfig,
        );
        console.log('order', JSON.stringify(orderById, null, 2));
  
        if (!orderById) {
          return;
        }
  
        //  console.log('Fetched checkout:', checkout);
        //  console.log('Fetched campaign:', campaign);
  
        //  if (
        //    campaign?.related_order_created &&
        //    checkout.completedAt !== null
        //  )
        //    return null;
  
        //  const order = await this.databaseService.order.findUnique({
        //    where: { checkout_id: checkout.shopify_id },
        //  });
  
        //  //get order
  
        if (order?.tags && campaign.filters.is_order_tag_filter_enabled) {
          const tagsfromField = getTagsArray(orderById?.tags);
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
              !anyTagPresent(tagsfromField, campaign.filters.order_tag_filter_any)
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
        //    const shopifyConfig = getShopifyConfig(campaign.Business);
        //    const customer = checkout.customer as any;
        //    const getCustomerById = await this.getCustomerById(
        //      customer?.id?.toString(),
        //      shopifyConfig,
        //    );
        //    //customer filter
        if (campaign.filters.is_customer_tag_filter_enabled) {
          const tagsfromField = getTagsArray(orderById.customer?.tags);
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
              return;
          }
        }
        //    //ProductTags
  
        const ProductList = orderById?.lineItems?.product as any;
  
        if (ProductList && campaign.filters.is_product_tag_filter_enabled) {
          const tagsFromField = getTagsArray(
            ProductList?.map((product) => product.tags),
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
        //    //discount_code
        if (campaign.filters.is_discount_code_filter_enabled) {
          const discount_code = orderById.discountCodes as any;
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
            !campaign.filters.discount_code_filter_any.includes(
              orderById.paymentGatewayNames,
            )
          ) {
            return;
          }
  
          if (
            campaign.filters.discount_code_filter_none.length > 0 &&
            campaign.filters.discount_code_filter_none.includes(
              orderById.paymentGatewayNames,
            )
          ) {
            return;
          }
        }
        //resolving tags\
        if (
          campaign.filters.is_payment_option_filter_enabled &&
          orderById.displayFinancialStatus &&
          campaign.filters.payment_options_type !==
            orderById.displayFinancialStatus
        ) {
          return;
        }
        if (campaign.filters.is_send_to_unsub_customer_filter_enabled) {
          if (
            campaign.filters.send_to_unsub_customer == false &&
            orderById.customer.emailMarketingConsent.marketingState !==
              'subscribed'
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
          orderById.totalDiscounts &&
          campaign.filters.is_discount_amount_filter_enabled
        ) {
          const discountAmount = Number(orderById.totalDiscounts);
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
        //    // Proceed with processing the order
        if (campaign.filters.is_order_count_filter_enabled) {
          const orderCount = Number(orderById.customer.OrderCount);
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
  
        //  // Abandoned Checkout Logic
        if (campaign.new_checkout_abandonment_filter === true) {
          const trigger_time = campaign.new_checkout_abandonment_time as any;
          const abandonedCartDate = getFromDate(
            campaign.new_checkout_abandonment_type === 'AFTER_EVENT'
              ? '0 minutes'
              : `${trigger_time.time} ${trigger_time.unit}`,
          );
  
          const abandoned_checkout =
            await this.databaseService.checkout.findFirst({
              where: {
                phone: sanitizePhoneNumber(orderById.customer.phone),
  
                completedAt: null,
                createdAt: { gt: abandonedCartDate },
              },
            });
          if (abandoned_checkout) {
            return;
          }
        }
  
        if (campaign.related_order_cancelled && orderById.cancelledAt) {
          return;
        }
        if (
          campaign.related_order_fulfilled &&
          orderById.displayFulfillmentStatus !== 'UNFULFILLED'
        ) {
          return;
        }
  
        const linkOrderWithCampaign =
          await this.databaseService.orderCampaign.create({
            data: {
              orderId: orderId,
              campaignId: campaign.id,
            },
          });
  
        let razorpaymentUrl = '';
  
        const components = [];
        const { header, buttons, body } = campaign.components as any;
  
        const isCodToCheckoutLink = buttons.some(
          (button) => button.segmentname === 'cod_to_checkout_link',
        );
        if (isCodToCheckoutLink) {
          const data = await this.razorpayService.generatePaymentLink(
            razorpayConfig,
            {
              name: orderById.customer.displayName,
              contact: orderById.customer.phone,
            },
            Number(orderById.totalPrice),
            'cod to checkout link',
          );
  
          razorpaymentUrl = data.short_url;
          await this.databaseService.paymentLink.create({
            data: {
              order_id: orderId,
              campaign_id: campaignId,
              razorpay_link_id: data.id,
              amount: orderById.totalPrice,
              currency: 'INR',
              description: 'cod to checkout link',
              customer_name: orderById.customer.displayName,
              customer_phone: sanitizePhoneNumber(orderById.customer.phone),
              status: data.status,
              short_url: data.short_url,
            },
          }); // Ensure safe accessrazorpayLink);
        }
  
        const response = await this.whatsappService.findSpecificTemplate(
          whatsappConfig,
          campaign.template_name,
        );
        const template = response?.data?.[0];
        // Ensure safe access
  
        // // Process header component
        if (header && header.isEditable) {
          let headerValue = '';
          if (header.type === 'TEXT') {
            headerValue = header.fromsegment
              ? this.getOrderValue(orderById, header.segmentname)
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
        }
  
        // Process body component parameters
        const bodyParameters = body.map((param) => {
          const value = param.fromsegment
            ? this.getOrderValue(orderById, param.segmentname)
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
  
        // Process buttons
        
  
        const isLinkTrackEnabled: boolean =
          isTemplateButtonRedirectSafe(template);
  
          let trackId;
          let trackUrl;
           for (const [index, button] of buttons.entries()) {
             console.log(`Button [${index}]:`, button);
           
             if (button.type === 'URL' && button.isEditable === true) {
               if (!isLinkTrackEnabled) {
                 components.push({
                   type: 'button',
                   sub_type: 'url',
                   index,
                   parameters: [
                     {
                       type: 'text',
                       text:  button.fromsegment
                       ? button.segmentname === 'cod_to_checkout_link'
                         ? razorpaymentUrl
                         : this.getOrderValue(orderById, button.segmentname)
                       : button.value,
                     },
                   ],
                 });
               } else {
                 const url = await this.databaseService.linkTrack.create({
                   data: {
                     link:  button.fromsegment
                     ? button.segmentname === 'cod_to_checkout_link'
                       ? razorpaymentUrl
                       : this.getOrderValue(orderById, button.segmentname)
                     : button.value,
                     buisness_id: campaign.businessId,
                     utm_source: "roi_magnet",
                     utm_medium: "whatsapp",
                   },
                 });
           
                  trackId = url.id;
               trackUrl = `go/${trackId}`;
           
                 components.push({
                   type: 'button',
                   sub_type: 'url',
                   index,
                   parameters: [
                     {
                       type: 'text',
                       text: trackUrl,
                     },
                   ],
                 });
               }
             } else if (button.type === 'COPY_CODE') {
               components.push({
                 type: 'button',
                 sub_type: 'COPY_CODE',
                 index,
                 parameters: [
                   {
                     type: 'coupon_code',
                     coupon_code: button.value,
                   },
                 ],
               });
             }
           }
           
  
        const messageResponse = await this.whatsappService.sendTemplateMessage(
          {
            recipientNo: orderById.customer.phone,
            templateName: template.name,
            languageCode: template.language,
            components,
          },
          whatsappConfig,
        );
  
        const footer = template.components.find(
          (component) => component.type === 'footer',
        );
        let bodycomponent = template.components.find(
          (component) => component.type.toLowerCase() === 'body',
        );
  
        let bodyRawText = '';
        if (bodycomponent && bodycomponent.text) {
          bodyRawText = bodycomponent.text;
  
          // Build a mapping for placeholders from the body parameters
          const mapping = body.reduce(
            (acc, param) => {
              // Clean up parameter name (remove any curly braces if present)
              const key = param.parameter_name.replace(/{{|}}/g, '');
              // Use getCheckoutValue if the value should come from checkout data; otherwise, fallback to param.value
              const value = param.fromsegment
                ? this.getOrderValue(orderById, param.segmentname)
                : param.value;
              acc[key] = value;
  
              return acc;
            },
            {} as Record<string, string | number | null>,
          );
  
          // Replace each placeholder in the bodyRawText with its mapped value
          Object.keys(mapping).forEach((placeholder) => {
            const escapedPlaceholder = escapeRegExp(placeholder);
            // Create a regex pattern to match the placeholder wrapped in curly braces,
            // with optional whitespace inside the braces.
            const regex = new RegExp(`{{\\s*${escapedPlaceholder}\\s*}}`, 'g');
  
            bodyRawText = bodyRawText.replace(
              regex,
              mapping[placeholder] as string,
            );
          });
  
          // Remove any remaining curly braces in case some placeholders weren't replaced
          bodyRawText = bodyRawText.replace(/{{|}}/g, '');
        }
        const updatedButtons = buttons.map((button) => {
          if (button.type === 'URL' && button.isEditable === true) {
            const findButtonfromtemplate = template.components.find(
              (component) => component.type === 'BUTTONS'
            );
            if (findButtonfromtemplate) {
              const templateUrlButton = findButtonfromtemplate.buttons.find(
                (btn) => btn.type === 'URL'
              );
              if (templateUrlButton && templateUrlButton.url) {
                console.log('Original template URL:', templateUrlButton.url);
                const placeholder = '{{1}}';
                const finalUrl = templateUrlButton.url.split(placeholder).join(isLinkTrackEnabled? trackUrl : button.value);
                console.log('✅ Final URL:', finalUrl);
                return {
                  ...button,
                  value: finalUrl,
                };
              }
            }
          }
          return button;
        });
  
        const prospect = await this.databaseService.prospect.upsert({
          where: {
            buisnessNo_phoneNo: {
              buisnessNo: campaign.Business.whatsapp_mobile,
              phoneNo: sanitizePhoneNumber(orderById.customer.phone),
            },
          },
          update: {},
          create: {
            phoneNo: sanitizePhoneNumber(orderById.customer.phone),
            name: orderById.customer.name,
            email: orderById.customer.email,
  
            lead: 'LEAD',
            buisnessNo: campaign.Business.whatsapp_mobile,
          },
        });
  
        // Save chat record to the database
        // console.log('Creating chat record in DB for contact:', contact);
        const addTodb = await this.databaseService.chat.create({
          data: {
            prospectId: prospect.id,
            chatId: messageResponse?.messages[0]?.id ?? '',
            template_used: true,
            template_name: campaign.template_name,
            senderPhoneNo: campaign.Business.whatsapp_mobile,
            receiverPhoneNo: sanitizePhoneNumber(orderById.customer.phone),
            sendDate: new Date(),
            header_type: header?.type,
            header_value:
              header?.isEditable && header?.type === 'TEXT'
                ? this.getOrderValue(orderById, header.segmentname)
                : header?.value,
            body_text: bodyRawText,
            footer_included: footer ? true : false,
            footer_text: footer?.text || '',
            Buttons: updatedButtons,
            type: template.type || 'text',
            template_components: components,
            isForCampaign: true,
            campaignId: campaign.id,
          },
        });
      } catch (error) {
        console.error('Error in getShopifyPercentageDiscount:', error);
        throw error;
      }
    }
   

   async getOrderById(orderId: string, config: any) {
     // Helper function using lodash to flatten "edges" structures recursively.
    
   
     try {
      const query = `
  query getOrder($id: ID!) {
    order(id: $id) {
      id
      name
      email
      phone
      createdAt
      processedAt
      fulfillments(first: 250) {
        deliveredAt
        displayStatus
        trackingInfo {
          url
          number
          company
        }
        updatedAt
      }
      statusPageUrl
       totalDiscounts
      totalPrice
      displayFinancialStatus
      displayFulfillmentStatus
       paymentGatewayNames
      discountCode
      discountCodes
      cancelReason
      tags
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
      lineItems(first: 250) {
        edges {
          node {
            title
            image {
              url
            }
            product {
              tags
              title
              images(first: 250) {
                edges {
                  node {
                    id
                    altText
                    url
                  }
                }
              }
            }
            quantity
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
      shippingAddress {
        address1
        address2
        city
        country
        zip
      }
      billingAddress {
        address1
        city
        province
        zip
        country
      }
    }
  }
`;

   
       const variables = { id: `gid://shopify/Order/${orderId}` };
   
       const { data: response , errors} = await this.shopifyService.executeGraphQL(
         query,
         variables,
         config,
       );

       if (errors) {
         console.error('Error executing GraphQL query:', errors);
         throw new Error('Error executing GraphQL query');
       }
   

   
       if (!response?.order) {
         return
       }
   
       // Clean the order data by flattening any "edges" wrappers using lodash.
       const cleanedOrder = this.cleanOrderData(response?.order);
       console.log('Cleaned order data:', JSON.stringify(cleanedOrder, null, 2));
   
       return cleanedOrder;
     } catch (error) {
       console.error('Error in getOrderById:', error);
       throw error;
     }
   }
    cleanOrderData(order: any): any {
    // Clone the order object (shallow clone is fine here if we overwrite nested objects)
    const cleanedOrder = { ...order };
  
    // Clean lineItems: replace the edges wrapper with an array of nodes
    if (cleanedOrder.lineItems && cleanedOrder.lineItems.edges) {
      cleanedOrder.lineItems = cleanedOrder.lineItems.edges.map((edge: any) => {
        const lineItem = { ...edge.node };
  
        // If the product has images in an "edges" structure, flatten it to an array of URLs
        if (lineItem.product && lineItem.product.images && lineItem.product.images.edges) {
          lineItem.product.images = lineItem.product.images.edges.map((imgEdge: any) => imgEdge.node.url);
        }
        return lineItem;
      });
    }
  
    return cleanedOrder;
  }

  getOrderValue(orderData: any, key: string, config?: any): string | number | null {
    const mapping: Record<string, any> = {
      customer_full_name: `${orderData.customer?.firstName || ''} ${orderData.customer?.lastName || ''}`.trim(),
      customer_email: orderData.customer?.email || null,
      customer_phone: orderData.customer?.phone || orderData.phone || null,
      order_total_items: orderData.lineItems?.reduce(
        (acc: number, item: any) => acc + item.quantity,
        0
      ) || 0,
      order_total_price: orderData.totalPrice || '0.00',
      order_total_tax: orderData.totalTaxSet?.shopMoney?.amount || '0.00',
      order_status: orderData.displayFinancialStatus || 'UNKNOWN',
      order_fulfillment_status: orderData.displayFulfillmentStatus || 'UNKNOWN',
      order_payment_gateway: orderData.paymentGatewayNames?.join(', ') || 'UNKNOWN',
      order_status_link: orderData.statusPageUrl || null,
      shop_url: orderData.shopUrl || null,
      shipping_address: orderData.shippingAddress
        ? `${orderData.shippingAddress.address1}, ${orderData.shippingAddress.city}, ${orderData.shippingAddress.country}, ${orderData.shippingAddress.zip}`
        : null,
      billing_address: orderData.billingAddress
        ? `${orderData.billingAddress.address1}, ${orderData.billingAddress.city}, ${orderData.billingAddress.province}, ${orderData.billingAddress.country}, ${orderData.billingAddress.zip}`
        : null,
      cart_items: orderData.lineItems?.map((item: any) => item.title).join(', ') || null,
      order_id: orderData.id || null,
      order_date: orderData.createdAt || null,
    };
    
  
    return mapping.hasOwnProperty(key) ? mapping[key] : key;
  }
  

   
}
