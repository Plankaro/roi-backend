import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import {
  getWhatsappConfig,
  sanitizePhoneNumber,
  getShopifyConfig,
} from 'utils/usefulfunction';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';
import { randomBytes } from 'crypto';
import { GemniService } from 'src/gemni/gemni.service';
import { ShopifyService } from 'src/shopify/shopify.service';
import { Prospect } from 'src/prospects/entities/prospect.entity';

@Injectable()
@Processor('bottransferQueue')
export class BottransferQueue extends WorkerHost {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly whatsappService: WhatsappService,
    private readonly gemniService: GemniService,
    private readonly shopifyService: ShopifyService,
  ) {
    super();
  }

  async process(job: Job<any>): Promise<void> {
    // Destructure job data (job.data is usually an object)
    const { chatMessageId, gemniResponse, isFirstMessage } = job.data;
    console.log('Processing job for Chat Message ID:', chatMessageId);
    console.log(
      'Gemni Response:',
      gemniResponse,
      'isFirstMessage:',
      isFirstMessage,
    );

    const category = gemniResponse?.category;
    const chatMessage = await this.databaseService.chat.findUnique({
      where: { id: chatMessageId },
      include: {
        Prospect: { include: { business: true } },
      },
    });
    console.log('Chat Message details:', chatMessage);

    const whaatsappConfig = getWhatsappConfig(chatMessage.Prospect.business);
    const shopifyConfig = getShopifyConfig(chatMessage.Prospect.business);

    // Customize welcome message
    const welcomeMessage = `
Hello, *${chatMessage.Prospect.name || 'user'}!* Welcome to our store. I'm here to help you.
Please reply with one of the following options:
1️⃣ for discount inquiries,
2️⃣ to browse our latest products,
3️⃣ to track your order,
4️⃣ to cancel your order,
5️⃣ for shipping charges,
6️⃣ to repeat an order.
How can I assist you today?
`;

    // If it's the first message, send the welcome message and create a chat record
    if (isFirstMessage) {
      console.log('Sending welcome message...');
      const firstMessage = await this.whatsappService.sendMessage(
        sanitizePhoneNumber(chatMessage.Prospect.phoneNo),
        welcomeMessage,
        whaatsappConfig,
      );
      console.log('WhatsApp Service Response (welcome):', firstMessage);

      try {
        const botResponse = await this.databaseService.chat.create({
          data: {
            prospectId: chatMessage.Prospect.id,
            chatId: firstMessage?.messages?.[0]?.id ?? '',
            senderPhoneNo: chatMessage.Prospect.business.whatsapp_mobile,
            receiverPhoneNo: firstMessage?.contacts?.[0]?.input ?? '',
            sendDate: new Date(),
            body_text: welcomeMessage,
            type: 'automated',
            isAutomated: true,
            botName: 'welcome-bot',
          },
        });
        console.log('Bot response record created (welcome):', botResponse);
      } catch (error) {
        console.error('Error creating bot response record (welcome):', error);
      }
      return;
    }

    // Process subsequent messages based on the bot response category
    switch (category) {
      case 'discount_bot':
        console.log('Processing discount_bot category');
        if (chatMessage.body_text === '1') {
          const seeIfPreviousMessageIsWelcomeBot =
            await this.databaseService.chat.findFirst({
              where: {
                botName: 'welcome-bot',
                isAutomated: true,
                receiverPhoneNo: chatMessage.senderPhoneNo,
                sendDate: {
                  gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
                },
              },
              orderBy: { sendDate: 'desc' },
              take: 1,
            });
          console.log(
            'Previous welcome-bot message found:',
            seeIfPreviousMessageIsWelcomeBot,
          );
          if (!seeIfPreviousMessageIsWelcomeBot) {
            console.log(
              'No welcome-bot message found. Exiting discount_bot flow.',
            );
            return;
          }
        }

        const isDiscountGivenWithinWeek =
          await this.databaseService.discount.findFirst({
            where: {
              prospect_phone: sanitizePhoneNumber(chatMessage.senderPhoneNo),
              createdAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
              },
            },
            orderBy: { createdAt: 'desc' },
            take: 1,
          });
        console.log('Discount given within week:', isDiscountGivenWithinWeek);

        if (isDiscountGivenWithinWeek) {
          const message =
            'You have already received a discount offer within the last week. Please wait until the offer expires before applying for another discount.';
          console.log(
            'Sending message for already received discount:',
            message,
          );
          const sendMessage = await this.whatsappService.sendMessage(
            sanitizePhoneNumber(chatMessage.Prospect.phoneNo),
            message,
            whaatsappConfig,
          );
          await this.databaseService.chat.create({
            data: {
              prospectId: chatMessage.Prospect.id,
              chatId: sendMessage?.messages?.[0]?.id ?? '',
              senderPhoneNo: chatMessage.Prospect.business.whatsapp_mobile,
              receiverPhoneNo: sendMessage?.contacts?.[0]?.input ?? '',
              sendDate: new Date(),
              body_text: message,
              type: 'automated',
              isAutomated: true,
              botName: 'discount-bot',
            },
          });
          return;
        }

        // Generate a unique discount code
        const discountCode = `DISC-${randomBytes(4).toString('hex')}`;
        console.log('Generated discount code:', discountCode);
        // Generate discount via Shopify API
        const generateDiscount = await this.getShopifyPercentageDiscount(
          discountCode,
          shopifyConfig,
        );
        console.log('Shopify discount response:', generateDiscount);

        if (!generateDiscount.endsAt) {
          const message =
            'Sorry there was an issue in generating the discount code. Please try again later.';
          console.error('Shopify discount generation failed.');
          const sendMessage = await this.whatsappService.sendMessage(
            sanitizePhoneNumber(chatMessage.Prospect.phoneNo),
            message,
            whaatsappConfig,
          );
          await this.databaseService.chat.create({
            data: {
              prospectId: chatMessage.Prospect.id,
              chatId: sendMessage?.messages?.[0]?.id ?? '',
              senderPhoneNo: chatMessage.Prospect.business.whatsapp_mobile,
              receiverPhoneNo: sendMessage?.contacts?.[0]?.input ?? '',
              sendDate: new Date(),
              body_text: message,
              type: 'automated',
              isAutomated: true,
              botName: 'discount-bot',
            },
          });
          return;
        }

        const discountMessage = `🎉 Here is your discount code:
*${discountCode}*

Enjoy a 15% discount on your next purchase.
Hurry, offer valid for a limited time!`;
        console.log('Sending discount message:', discountMessage);
        const sendMessage = await this.whatsappService.sendMessage(
          sanitizePhoneNumber(chatMessage.Prospect.phoneNo),
          discountMessage,
          whaatsappConfig,
        );
        console.log('Discount message sent, WhatsApp response:', sendMessage);
        await this.databaseService.chat.create({
          data: {
            prospectId: chatMessage.Prospect.id,
            chatId: sendMessage?.messages?.[0]?.id ?? '',
            senderPhoneNo: chatMessage.Prospect.business.whatsapp_mobile,
            receiverPhoneNo: sendMessage?.contacts?.[0]?.input ?? '',
            sendDate: new Date(),
            body_text: discountMessage,
            type: 'automated',
            isAutomated: true,
            botName: 'discount-bot',
          },
        });
        const discountRecord = await this.databaseService.discount.create({
          data: {
            title: 'Percentage Discount using bot',

            code: discountCode,
            type: 'PERCENTAGE',
            amount: 15,
            prospect: { connect: { phoneNo: chatMessage.Prospect.phoneNo } },
          },
        });
        console.log('Discount record created in DB:', discountRecord);
        break;

      case 'product_browsing_bot':
        if (chatMessage.body_text === '2') {
          const seeIfPreviousMessageIsWelcomeBot =
            await this.databaseService.chat.findFirst({
              where: {
                botName: 'welcome-bot',
                isAutomated: true,
                receiverPhoneNo: chatMessage.senderPhoneNo,
                sendDate: {
                  gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
                },
              },
              orderBy: { sendDate: 'desc' },
              take: 1,
            });
          console.log(
            'Previous welcome-bot message found:',
            seeIfPreviousMessageIsWelcomeBot,
          );
          if (!seeIfPreviousMessageIsWelcomeBot) {
            console.log(
              'No welcome-bot message found. Exiting discount_bot flow.',
            );
            return;
          }
        }
        const getAllProducts = await this.getAllProducts(shopifyConfig);
        console.log('All products:', getAllProducts);
        const baseUrl = chatMessage.Prospect.business.shopify_domain;

        const message =
          `*Here are our products:*\n\n` +
          getAllProducts.products
            .map(
              (product, index) =>
                `*${index + 1}) ${product.title}*\n_Description_: ${product.description}\n🔗 *Link*: ${baseUrl}/products/${product.handle}\n`,
            )
            .join('\n');

        const messageSendResponse = await this.whatsappService.sendMessage(
          sanitizePhoneNumber(chatMessage.Prospect.phoneNo),
          message,
          whaatsappConfig,
        );
        console.log(
          'Product message sent, WhatsApp response:',
          messageSendResponse,
        );
        await this.databaseService.chat.create({
          data: {
            prospectId: chatMessage.Prospect.id,
            chatId: messageSendResponse?.messages?.[0]?.id ?? '',
            senderPhoneNo: chatMessage.Prospect.business.whatsapp_mobile,
            receiverPhoneNo: messageSendResponse?.contacts?.[0]?.input ?? '',
            sendDate: new Date(),
            body_text: message,
            type: 'automated',
            isAutomated: true,
            botName: 'product-browsing-bot',
          },
        });

        // Add product browsing logic here
        break;

      case 'order_tracking_bot':
        console.log('Handling order tracking request');
        if (gemniResponse) {
          const order = await this.getAllOrdersByCustomer(
            `+${sanitizePhoneNumber(chatMessage.senderPhoneNo)}`,
            shopifyConfig,
          );

          const message =
          order.orders.length === 0
            ? `No orders placed yet. Visit our website to place an order:\nhttps://roi-magnet-fashion.myshopify.com/`
            : `*Your Order Update:*\n\n` +
              order.orders
                .map((orderItem) => {
                  const orderDate = new Date(orderItem.createdAt).toLocaleDateString();
                  return (
                    
                    `*Order : ${orderItem.id.match(/\/Order\/(\d+)/)[1]}\n` +
                    `Placed on: ${orderDate}\n` +
                    `Total: ${orderItem.totalPrice}\n` +
                    `Track here: ${orderItem.orderStatusUrl}\n` +
                    `Products: ${orderItem.lineItems.map((item) => `*${item.title}*`).join(', ')}\n`
                  );
                })
                .join('\n') +
              `\nThank you for shopping with us!`;
        
        console.log(message);
        

        const messageSendResponse = await this.whatsappService.sendMessage(
          sanitizePhoneNumber(chatMessage.Prospect.phoneNo),
          message,
          whaatsappConfig,
        );
        await this.databaseService.chat.create({
          data: {
            prospectId: chatMessage.Prospect.id,
            chatId: messageSendResponse?.messages?.[0]?.id ?? '',
            senderPhoneNo: chatMessage.Prospect.business.whatsapp_mobile,
            receiverPhoneNo: messageSendResponse?.contacts?.[0]?.input ?? '',
            sendDate: new Date(),
            body_text: message,
            type: 'automated',
            isAutomated: true,
            botName: 'order_tracking_bot',
          },
        });

        } else {
          console.log('No order ID provided for tracking.');
        }
        break;

      case 'order_cancelling_bot':
        console.log('Handling order cancellation request');
        // Add cancellation logic here
        if(!gemniResponse.id){
          console.log('No order ID provided for cancellation.');

        }
        break;

      case 'shipping_charges_bot':
       
          const shippingmessage = 
            `*Shipping Charges Information:*\n\n` +
            `Hi there!\n` +
            `We offer competitive shipping rates to get your order delivered quickly:\n` +
            `• Standard Shipping: Rs. 399 (3-5 business days)\n` +
            `• Express Shipping: Rs. 799 (1-2 business days)\n` +
            `Plus, enjoy FREE shipping on orders over Rs. 2000!\n\n` +
            `For more details, visit our website:\n` +
            `https://roi-magnet-fashion.myshopify.com/\n\n` +
            `Thank you for choosing us!`;

          const shippingmessageSendResponse = await this.whatsappService.sendMessage(
            sanitizePhoneNumber(chatMessage.Prospect.phoneNo),
            shippingmessage,
            whaatsappConfig,
          );
          await this.databaseService.chat.create({
            data: {
              prospectId: chatMessage.Prospect.id,
              chatId: shippingmessageSendResponse?.messages?.[0]?.id ?? '',
              senderPhoneNo: chatMessage.Prospect.business.whatsapp_mobile,
              receiverPhoneNo: shippingmessageSendResponse?.contacts?.[0]?.input ?? '',
              sendDate: new Date(),
              body_text: shippingmessage,
              type: 'automated',
              isAutomated: true,
              botName: 'shipping_charges_bot',
            },
          });
          break;
        
        // Add shipping charges logic here
        break;

      case 'repeat_order_bot':
        console.log('Handling repeat order request');
        // Add repeat order logic here
        break;

      case 'None':
        console.log('No valid category matched.');
        break;

      default:
        console.warn('Unhandled category:', category);
        break;
    }
  }

  async getShopifyPercentageDiscount(
    discountCode: string,
    config: any,
  ): Promise<{
    id: string;
    endsAt: string;
    recurringCycleLimit: number | null;
    createdAt: string;
  }> {
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

    // Set start date to now and end date to one month from now
    const startsAt = new Date().toISOString();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    const endsAt = endDate.toISOString();

    const variables = {
      basicCodeDiscount: {
        title: `Percentage Discount`, // Customize as needed
        code: discountCode,
        startsAt: startsAt,
        endsAt: endsAt,
        combinesWith: {
          orderDiscounts: true,
          productDiscounts: true,
          shippingDiscounts: true,
        },
        customerGets: {
          items: { all: true }, // Applies discount to all items
          value: {
            percentage: 0.1, // For example, a 10% discount; adjust as needed
          },
        },
        customerSelection: { all: true },
      },
    };

    console.log(
      'Executing Shopify GraphQL mutation with variables:',
      variables,
    );
    const response = await this.shopifyService.executeGraphQL(
      mutation,
      variables,
      config,
    );
    console.log('Raw Shopify response:', JSON.stringify(response, null, 2));

    const userErrors = response?.data?.discountCodeBasicCreate?.userErrors;
    if (userErrors && userErrors.length > 0) {
      const errorMessages = userErrors
        .map((err: any) => err.message)
        .join(', ');
      console.error('Discount generation user errors:', errorMessages);
      throw new Error(`Discount generation failed: ${errorMessages}`);
    }

    const discountData =
      response?.data?.discountCodeBasicCreate?.codeDiscountNode?.codeDiscount;
    if (!discountData) {
      throw new Error('No discount data returned from Shopify');
    }

    const cleanDiscountData = {
      id: discountData.id,
      endsAt: discountData.endsAt,
      recurringCycleLimit: discountData.recurringCycleLimit || null,
      createdAt: discountData.createdAt,
    };

    console.log(
      'Clean discount data:',
      JSON.stringify(cleanDiscountData, null, 2),
    );
    return cleanDiscountData;
  }
  async getAllProducts(
    config: any,
    first: number = 50,
    after: string | null = null,
  ): Promise<{
    products: Array<{
      id: string;
      title: string;
      handle: string;
      description: string;
      images: string[];
    }>;
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  }> {
    const query = `
      query GetAllProducts($first: Int!, $after: String) {
        products(first: $first, after: $after sortKey: RELEVANCE) {
          edges {
            node {
              id
              title
              handle
              description
              images(first: 10) {
                edges {
                  node {
                      url
                  }
                }
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `;

    const variables = { first, after };

    try {
      console.log(
        'Executing Shopify GraphQL query for products with variables:',
        variables,
      );
      const response = await this.shopifyService.executeGraphQL(
        query,
        variables,
        config,
      );
      console.log(
        'Raw Shopify products response:',
        JSON.stringify(response, null, 2),
      );

      // Extract and clean the products data
      const productEdges = response?.data?.products?.edges || [];
      const products = productEdges.map((edge: any) => {
        const product = edge.node;
        // Clean image data: extract originalSrc values into an array
        const images = (product.images?.edges || []).map(
          (imgEdge: any) => imgEdge.node.url,
        );
        return {
          id: product.id,
          title: product.title,
          handle: product.handle,
          images,
          description: product.description,
        };
      });

      const pageInfo = response?.data?.products?.pageInfo || {
        hasNextPage: false,
        endCursor: null,
      };
      const cleanData = { products, pageInfo };
      console.log('Clean products data:', JSON.stringify(cleanData, null, 2));
      return cleanData;
    } catch (error) {
      console.error('Error in getAllProducts:', error);
      throw error;
    }
  }
  async getAllOrdersByCustomer(
    contact: string,
    config: any, // Can be either phone or email
    first: number = 10,
    after: string | null = null,
  ): Promise<{
    orders: Array<{
      id: string;
      orderStatusUrl: string;
      totalPrice: string;
      createdAt: string;
      displayFinancialStatus: string;
      displayFulfillmentStatus: string;
      lineItems: Array<{ title: string; image: string | null }>;
    }>;
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  }> {
    // Determine if contact is an email or phone number
    const isEmail = contact.includes('@');
    const queryField = isEmail
      ? `customer_email:"${contact}"`
      : `customer_phone:${contact}`;

    const query = `
      query GetAllOrdersByCustomer($first: Int!, $after: String, $query: String!) {
        orders(first: $first, after: $after, query: $query, sortKey: PROCESSED_AT, reverse: true) {
          edges {
            node {
              id
              createdAt
              statusPageUrl
              totalPrice
              displayFinancialStatus
              displayFulfillmentStatus
              lineItems(first: 50) {
                edges {
                  node {
                    title
                    product {
                      images(first: 1) {
                        edges {
                          node {
                            url
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `;

    const variables = { first, after, query: queryField };

    try {
      console.log(
        'Executing Shopify GraphQL query for orders with contact:',
        contact,
      );
      const response = await this.shopifyService.executeGraphQL(
        query,
        variables,
        config,
      );
      console.log(
        'Raw Shopify orders response:',
        JSON.stringify(response, null, 2),
      );

      // Extract and clean the orders data
      const orderEdges = response?.data?.orders?.edges || [];
      const orders = orderEdges.map((edge: any) => {
        const order = edge.node;
        const lineItems = (order.lineItems?.edges || []).map(
          (itemEdge: any) => ({
            title: itemEdge.node.title,
            image: itemEdge.node.product?.images?.edges?.[0]?.node?.url || null, // Fetch first image from main product
          }),
        );

        return {
          id: order.id,
          orderStatusUrl: order.statusPageUrl,
          totalPrice: order.totalPrice,
          displayFinancialStatus: order.displayFinancialStatus,
          displayFulfillmentStatus: order.displayFulfillmentStatus,
          lineItems,
          createdAt: order.createdAt,
        };
      });

      const pageInfo = response?.data?.orders?.pageInfo || {
        hasNextPage: false,
        endCursor: null,
      };
      const cleanData = { orders, pageInfo };
      console.log('Clean orders data:', JSON.stringify(cleanData, null, 2));
      return cleanData;
    } catch (error) {
      console.error('Error in getAllOrdersByCustomer:', error);
      throw error;
    }
  }
}
