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
import { create } from 'domain';
import { discount_type } from '@prisma/client';
import { BotService } from 'src/bot/bot.service';
import { ChatsGateway } from '../chats.gateway';

@Injectable()
@Processor('bottransferQueue')
export class BottransferQueue extends WorkerHost {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly whatsappService: WhatsappService,
    private readonly gemniService: GemniService,
    private readonly shopifyService: ShopifyService,
    private readonly botService: BotService,
    private readonly chatsGateway: ChatsGateway,
  ) {
    super();
  }

  async process(job: Job<any>): Promise<void> {
    // Destructure job data (job.data is usually an object)
    const { chatMessageId, gemniResponse, isFirstMessage } = job.data;

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

    const bots = await this.botService.findAll(chatMessage.Prospect);

    // Customize welcome message

    // Process subsequent messages based on the bot response category
    switch (category) {
      case 'welcome_bot':
        if (!bots?.WELCOME || bots?.WELCOME?.is_active === false) return;
        const welcomeMessage = `
        Hey *${chatMessage.Prospect.name || 'there'}*! 👋 Welcome to our store — so happy to have you here!
        
        I'm your assistant, and I’m here to make your shopping experience super easy.  
        Feel free to ask me anything — I can help you with:
        
        • Discounts or ongoing offers  
        • Showing you our latest products 🛍️  
        • Tracking your order 📦  
        • Cancelling an order  
        • Shipping charges and delivery times 🚚  
        • Repeating a previous order 🔁  
        
        Just drop me a message with what you need — I’ve got you covered!
        `;

        // If it's the first message, send the welcome message and create a chat record
        const isWelcomeBotEnabled = await this.databaseService.bots.findUnique({
          where: {
            buisness_id_type: {
              buisness_id: chatMessage.Prospect.business.id,
              type: 'WELCOME',
            },
          },
        });
        if (!isWelcomeBotEnabled) {
          return;
        }

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
          await this.chatsGateway.sendMessageToSubscribedClients(
            chatMessage.Prospect.business.id,
            'messages',
            botResponse,
          );
        } catch (error) {
          console.error('Error creating bot response record (welcome):', error);
        }
        break;

      case 'discount_bot':
        console.log('Processing discount_bot category');
        // if (chatMessage.body_text === '1') {
        //   const seeIfPreviousMessageIsWelcomeBot =
        //     await this.databaseService.chat.findFirst({
        //       where: {
        //         botName: 'welcome-bot',
        //         isAutomated: true,
        //         receiverPhoneNo: chatMessage.senderPhoneNo,
        //         sendDate: {
        //           gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
        //         },
        //       },
        //       orderBy: { sendDate: 'desc' },
        //       take: 1,
        //     });
        //   console.log(
        //     'Previous welcome-bot message found:',
        //     seeIfPreviousMessageIsWelcomeBot,
        //   );
        //   if (!seeIfPreviousMessageIsWelcomeBot) {
        //     console.log(
        //       'No welcome-bot message found. Exiting discount_bot flow.',
        //     );
        //     return;
        //   }
        // }
        const isDiscountBotEnabled = bots?.DISCOUNT;
        if (
          !isDiscountBotEnabled ||
          isDiscountBotEnabled?.is_active === false
        ) {
          return;
        }

        const isDiscountGivenwithinTime =
          await this.databaseService.discount.findFirst({
            where: {
              prospect_id: chatMessage.Prospect.id,
              createdAt: {
                gte: new Date(
                  Date.now() -
                    Number(
                      isDiscountBotEnabled.no_of_days_before_asking_discount,
                    ) *
                      24 *
                      60 *
                      60 *
                      1000,
                ), // 1 week ago
              },
            },
            orderBy: { createdAt: 'desc' },
            take: 1,
          });
        console.log('Discount given within week:', isDiscountGivenwithinTime);

        if (isDiscountGivenwithinTime) {
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
          const botResponse = await this.databaseService.chat.create({
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
          await this.chatsGateway.sendMessageToSubscribedClients(
            chatMessage.Prospect.business.id,
            'messages',
            botResponse,
          );
          return;
        }

        // Generate a unique discount code
        const discountCode = `DISC-${randomBytes(4).toString('hex')}`;
        console.log('Generated discount code:', discountCode);
        // type: discount_type,
        // value: string,

        // no_of_days: string,
        // min_amount: string,
        // config: any,
        const generateDiscount = await this.getShopifyDiscount(
          isDiscountBotEnabled.discount_type,
          isDiscountBotEnabled.discount_amount,
          isDiscountBotEnabled.discount_expiry,
          isDiscountBotEnabled.discount_minimum,
          shopifyConfig,
        );
        console.log('Shopify discount response:', generateDiscount);

        if (!generateDiscount) {
          const message =
            'Sorry there was an issue in generating the discount code. Please try again later.';
          console.error('Shopify discount generation failed.');
          const sendMessage = await this.whatsappService.sendMessage(
            sanitizePhoneNumber(chatMessage.Prospect.phoneNo),
            message,
            whaatsappConfig,
          );
          const botResponse = await this.databaseService.chat.create({
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
          await this.chatsGateway.sendMessageToSubscribedClients(
            chatMessage.Prospect.business.id,
            'messages',
            botResponse,
          );
          return;
        }

        const discountMessage = `🎉 You've unlocked a special offer!

Here’s your personal discount code: *${generateDiscount}*

Enjoy ${
          isDiscountBotEnabled.discount_type === discount_type.PERCENTAGE
            ? `${isDiscountBotEnabled.discount_amount}% off`
            : `${isDiscountBotEnabled.discount_amount} ₹ off`
        } on your next purchase.

This offer is valid for the next ${isDiscountBotEnabled.discount_expiry} days, so don’t miss out! Happy shopping 🛍️`;

        console.log('Sending discount message:', discountMessage);
        const sendMessage = await this.whatsappService.sendMessage(
          sanitizePhoneNumber(chatMessage.Prospect.phoneNo),
          discountMessage,
          whaatsappConfig,
        );
        console.log('Discount message sent, WhatsApp response:', sendMessage);
        const botResponse = await this.databaseService.chat.create({
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
        await this.chatsGateway.sendMessageToSubscribedClients(
          chatMessage.Prospect.business.id,
          'messages',
          botResponse,
        );
        const discountRecord = await this.databaseService.discount.create({
          data: {
            title: 'Percentage Discount using bot',

            code: discountCode,
            type: 'PERCENTAGE',
            amount: 15,
            prospect_id: chatMessage.Prospect.id,
          },
        });
        console.log('Discount record created in DB:', discountRecord);
        break;

      case 'product_browsing_bot':
        if (
          !bots.PRODUCT_BROWSING ||
          bots.PRODUCT_BROWSING.is_active == false
        ) {
          return;
        }

        const getAllProducts = await this.getAllCollections(shopifyConfig);
        console.log('All products:', getAllProducts);
        const baseUrl = chatMessage.Prospect.business.shopify_domain;

        const message =
          `*Here are our products:*\n\n` +
          getAllProducts.collections
            .map(
              (product, index) =>
                `*${index + 1}) ${product.title}*\n_Description_: ${product.description}\n🔗 *Link*: ${baseUrl}/collections/${product.handle}\n`,
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
        const response = await this.databaseService.chat.create({
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
        await this.chatsGateway.sendMessageToSubscribedClients(
          chatMessage.Prospect.business.id,
          'messages',
          response,
        );
        // Add product browsing logic here
        break;

      case 'order_tracking_bot':
        if (!bots.ORDER_TRACK || bots.ORDER_TRACK.is_active == false) {
          return;
        }
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
                    const orderDate = new Date(
                      orderItem.createdAt,
                    ).toLocaleDateString();
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
          const botResponse = await this.databaseService.chat.create({
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
          await this.chatsGateway.sendMessageToSubscribedClients(
            chatMessage.Prospect.business.id,
            'messages',
            botResponse,
          );
        } else {
          console.log('No order ID provided for tracking.');
        }
        break;

      case 'order_cancelling_bot':
        if (!bots.ORDER_CANCEL || bots.ORDER_CANCEL.is_active == false) {
          return;
        }
        // Add cancellation logic here
        if (!gemniResponse.orderId) {
          const order = await this.getUnfulfilledOrdersByCustomer(
            `+${sanitizePhoneNumber(chatMessage.senderPhoneNo)}`,
            shopifyConfig,
          );

          const cancelmessage =
            order.orders.length === 0
              ? `No orders which can be cancelled are displayed`
              : `*Your Order cancel list select the orderId which you want to cancel:*\n\n` +
                order.orders
                  .map((orderItem) => {
                    const orderDate = new Date(
                      orderItem.createdAt,
                    ).toLocaleDateString();
                    return (
                      `*Order : ${orderItem.id.match(/\/Order\/(\d+)/)[1]}\n` +
                      `Placed on: ${orderDate}\n` +
                      `Total: ${orderItem.totalPrice}\n` +
                      `Track here: ${orderItem.orderStatusUrl}\n` +
                      `Fullfillment Status: ${orderItem.displayFulfillmentStatus}\n` +
                      `Products: ${orderItem.lineItems.map((item) => `*${item.title}*`).join(', ')}\n`
                    );
                  })
                  .join('\n') +
                `\nThank you for shopping with us!`;

          const cancelOrderMessage = await this.whatsappService.sendMessage(
            sanitizePhoneNumber(chatMessage.Prospect.phoneNo),
            cancelmessage,
            whaatsappConfig,
          );

          const botResponse = await this.databaseService.chat.create({
            data: {
              prospectId: chatMessage.Prospect.id,
              chatId: cancelOrderMessage?.messages?.[0]?.id ?? '',
              senderPhoneNo: chatMessage.Prospect.business.whatsapp_mobile,
              receiverPhoneNo: cancelOrderMessage?.contacts?.[0]?.input ?? '',
              sendDate: new Date(),
              body_text: cancelmessage,
              type: 'automated',
              isAutomated: true,
              botName: 'order_cancelling_bot',
            },
          });
          await this.chatsGateway.sendMessageToSubscribedClients(
            chatMessage.Prospect.business.id,
            'messages',
            botResponse,
          );
          return;
        }
        // Add cancellation logic here
        const cancel = await this.cancelOrder(
          gemniResponse.orderId,
          `+${chatMessage.Prospect.phoneNo}`,
          shopifyConfig,
        );
        const cancelOrder = cancel?.message;
        // ? "Your order has been canceled."
        // : "We couldn't cancel your order. Please contact support.";

        const cancelOrderMessage = await this.whatsappService.sendMessage(
          sanitizePhoneNumber(chatMessage.Prospect.phoneNo),
          cancelOrder,
          whaatsappConfig,
        );

        const chatResponse = await this.databaseService.chat.create({
          data: {
            prospectId: chatMessage.Prospect.id,
            chatId: cancelOrderMessage?.messages?.[0]?.id ?? '',
            senderPhoneNo: chatMessage.Prospect.business.whatsapp_mobile,
            receiverPhoneNo: cancelOrderMessage?.contacts?.[0]?.input ?? '',
            sendDate: new Date(),
            body_text: cancelOrder,
            type: 'automated',
            isAutomated: true,
            botName: 'order_cancelling_bot',
          },
        });
        await this.chatsGateway.sendMessageToSubscribedClients(
          chatMessage.Prospect.business.id,
          'messages',
          chatResponse,
        );

        break;

      case 'shipping_charges_bot':
        if (
          !bots.SHIPPING_CHARGES ||
          bots.SHIPPING_CHARGES.is_active == false
        ) {
          return;
        }

        const shippingmessage = this.generateShippingMessage(
          bots.SHIPPING_CHARGES.shipping_standard_cost,
          bots.SHIPPING_CHARGES.shipping_threshold,
          bots.SHIPPING_CHARGES.international_shipping_cost,
        );
        const shippingmessageSendResponse =
          await this.whatsappService.sendMessage(
            sanitizePhoneNumber(chatMessage.Prospect.phoneNo),
            shippingmessage,
            whaatsappConfig,
          );
        const shippingChatResponse = await this.databaseService.chat.create({
          data: {
            prospectId: chatMessage.Prospect.id,
            chatId: shippingmessageSendResponse?.messages?.[0]?.id ?? '',
            senderPhoneNo: chatMessage.Prospect.business.whatsapp_mobile,
            receiverPhoneNo:
              shippingmessageSendResponse?.contacts?.[0]?.input ?? '',
            sendDate: new Date(),
            body_text: shippingmessage,
            type: 'automated',
            isAutomated: true,
            botName: 'shipping_charges_bot',
          },
        });
        await this.chatsGateway.sendMessageToSubscribedClients(
          chatMessage.Prospect.business.id,
          'messages',
          shippingChatResponse,
        );
        break;

      // Add shipping charges logic here

      case 'repeat_order_bot':
        if (!bots.REPEAT_ORDER || bots.REPEAT_ORDER.is_active == false) {
          return;
        }
        if (gemniResponse.orderId) {
          const placeOrder = await this.repeatOrder(
            gemniResponse.orderId,
            shopifyConfig,
          );
          console.log(placeOrder);
        }
        // Add repeat order logic here
        const repeatOrder = await this.repeatOrder(
          gemniResponse.orderId,
          shopifyConfig,
        );
        console.log(repeatOrder);

        break;
      
      case 'contacting_support_bot':
        const users = await this.databaseService.user.findMany({
          where:{
            businessId:chatMessage.Prospect.business.id,
          }
        })
        users.forEach(async (user) => {
          const notification = await this.databaseService.notification.create({
            data: {
              user:{connect:{ id: user.id }},
              Buisness:{connect:{ id: chatMessage.Prospect.business.id }},
              text:`Customer ${chatMessage.Prospect.phoneNo} is in need of help. Please reach out to them as soon as possible.`,
              status:'DELIVERED',
              type:"CUSTOMERSUPPORT"

            },

          })
          this.chatsGateway.sendMessageToSubscribedClients(
            chatMessage.Prospect.business.id,
            'notification',
            notification
          )
        })

      case 'None':
        console.log('No valid category matched.');
        break;

      default:
        console.warn('Unhandled category:', category);
        break;
    }
  }

  async getShopifyDiscount(
    type: discount_type,
    value: string,

    no_of_days: string,
    min_amount: string,
    config: any,
  ) {
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

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '');
    const discountCode = `DISC${value}-${timestamp}-${randomSuffix}`;

    const startsAt = new Date().toISOString();

    // 👇 Convert no_of_days string to number and calculate endsAt
    const endsAtDate = new Date();
    endsAtDate.setDate(endsAtDate.getDate() + parseInt(no_of_days || '30')); // Default to 30 if not provided
    const endsAt = endsAtDate.toISOString();

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
        discountAmount: { amount: discountValue, appliesOnEachItem: false },
      };
    } else {
      throw new Error('Invalid discount type');
    }

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
        customerSelection: { all: true },
        minimumRequirement: {
          subtotal: {
            greaterThanOrEqualToSubtotal: min_amount,
          },
        },
      },
    };

    try {
      const response = await this.shopifyService.executeGraphQL(
        mutation,
        variables,
        config,
      );
      return discountCode;
    } catch (error) {
      console.error('Error in getShopifyDiscount:', error);
      throw error;
    }
  }

  async getAllCollections(config: any): Promise<{
    collections: Array<{
      id: string;
      title: string;
      handle: string;
      description: string;
    }>;
  }> {
    const query = `
      query GetAllCollections {
        collections(first:10) {
          nodes {
            id
            title
            handle
            description
          }
        }
      }
    `;

    try {
      console.log('Executing Shopify GraphQL query for collections');
      const response = await this.shopifyService.executeGraphQL(
        query,
        {},
        config,
      );
      console.log(
        'Raw Shopify collections response:',
        JSON.stringify(response, null, 2),
      );

      // Extract and clean the collections data
      const collectionsNodes = response?.data?.collections?.nodes || [];
      const collections = collectionsNodes.map((node: any) => ({
        id: node.id,
        title: node.title,
        handle: node.handle,
        description: node.description,
      }));

      const cleanData = { collections };
      console.log(
        'Clean collections data:',
        JSON.stringify(cleanData, null, 2),
      );
      return cleanData;
    } catch (error) {
      console.error('Error in getAllCollections:', error);
      throw error;
    }
  }

  async getAllOrdersByCustomer(
    contact: string,
    config: any,
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
    const identifier = isEmail ? { email: contact } : { phoneNumber: contact };

    // GraphQL query
    const query = `
      query GetCustomerOrders($identifier: CustomerIdentifierInput!, $first: Int!, $after: String) {
        customerByIdentifier(identifier: $identifier) {
          id
          displayName
          phone
          orders(first: $first, after: $after, sortKey: PROCESSED_AT, reverse: true) {
            edges {
              node {
              
              phone
                id
                createdAt
                statusPageUrl
                totalPrice
                displayFinancialStatus
                displayFulfillmentStatus
                lineItems(first: 250) {
                  edges {
                    node {
                      id
                      title
                      variant {
                        id
                      }
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
      }
    `;

    const variables = { identifier, first, after };

    try {
      console.log(
        'Executing Shopify GraphQL query for customer orders with contact:',
        contact,
      );
      const response = await this.shopifyService.executeGraphQL(
        query,
        variables,
        config,
      );
      console.log(
        'Raw Shopify customer orders response:',
        JSON.stringify(response, null, 2),
      );

      // Validate that the customer exists
      if (!response?.data?.customerByIdentifier) {
        return {
          orders: [],
          pageInfo: { hasNextPage: false, endCursor: null },
        };
      }

      // Extract and clean the orders data
      const orderEdges = response.data.customerByIdentifier.orders.edges || [];
      const orders = orderEdges.map((edge: any) => {
        const order = edge.node;
        const lineItems = (order.lineItems?.edges || []).map(
          (itemEdge: any) => ({
            id: itemEdge.node.id,
            variantId: itemEdge.node.variant.id,
            title: itemEdge.node.title,
            image: itemEdge.node.product?.images?.edges?.[0]?.node?.url || null,
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

      const pageInfo = response.data.customerByIdentifier.orders.pageInfo || {
        hasNextPage: false,
        endCursor: null,
      };
      return { orders, pageInfo };
    } catch (error) {
      console.error('Error in getAllOrdersByCustomer:', error);
      throw error;
    }
  }

  async getUnfulfilledOrdersByCustomer(
    contact: string,
    config: any, // Configuration object for Shopify API access
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
    const identifier = isEmail ? { email: contact } : { phoneNumber: contact };

    const query = `
      query GetCustomerOrders($identifier: CustomerIdentifierInput!, $first: Int!, $after: String) {
        customerByIdentifier(identifier: $identifier) {
          id
          displayName
          phone
          orders(first: $first, after: $after, sortKey: PROCESSED_AT, reverse: true,query:"fulfillment_status:unfulfilled") {
            edges {
              node {
              
              phone
                id
                createdAt
                statusPageUrl
                totalPrice
                displayFinancialStatus
                displayFulfillmentStatus
                lineItems(first: 250) {
                  edges {
                    node {
                      id
                      title
                      variant {
                        id
                      }
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
      }
    `;

    const variables = { identifier, first, after };

    try {
      console.log(
        'Executing Shopify GraphQL query for unfulfilled orders with contact:',
        contact,
      );
      const response = await this.shopifyService.executeGraphQL(
        query,
        variables,
        config,
      );
      console.log(
        'Raw Shopify unfulfilled orders response:',
        JSON.stringify(response, null, 2),
      );

      // Extract and clean the orders data
      const orderEdges =
        response?.data?.customerByIdentifier?.orders?.edges || [];
      const orders = orderEdges.map((edge: any) => {
        const order = edge.node;
        const lineItems = (order.lineItems?.edges || []).map(
          (itemEdge: any) => ({
            title: itemEdge.node.title,
            image: itemEdge.node.product?.images?.edges?.[0]?.node?.url || null,
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

      const pageInfo = response?.data?.customerByIdentifier?.orders
        ?.pageInfo || {
        hasNextPage: false,
        endCursor: null,
      };
      const cleanData = { orders, pageInfo };
      console.log(
        'Clean unfulfilled orders data:',
        JSON.stringify(cleanData, null, 2),
      );
      return cleanData;
    } catch (error) {
      console.error('Error in getUnfulfilledOrdersByCustomer:', error);
      throw error;
    }
  }

  async cancelOrder(
    orderId: string,
    phoneNumber: string,
    config: any,
  ): Promise<{ status: boolean; message: string }> {
    // Convert to Shopify Global ID
    const shopifyOrderId = `gid://shopify/Order/${orderId}`;

    // GraphQL query to fetch order details
    const orderQuery = `
      query GetOrderDetails($orderId: ID!) {
        order(id: $orderId) {
          id
          customer {
            phone
          }
        }
      }
    `;

    try {
      // Fetch order details
      const response = await this.shopifyService.executeGraphQL(
        orderQuery,
        { orderId: shopifyOrderId },
        config,
      );

      const orderData = response?.data?.order;
      if (!orderData) {
        return { status: false, message: 'Order not found.' };
      }

      const customerPhone = orderData.customer?.phone;
      if (customerPhone !== phoneNumber) {
        return {
          status: false,
          message: "Phone number does not match the order's customer.",
        };
      }

      // Proceed with order cancellation
      const mutation = `
        mutation CancelOrder($orderId: ID!, $refund: Boolean!, $restock: Boolean!, $reason: OrderCancelReason!) {
          orderCancel(orderId: $orderId, refund: $refund, restock: $restock, reason: $reason) {
            userErrors {
              field
              message
            }
          }
        }
      `;

      const variables = {
        orderId: shopifyOrderId,
        refund: true,
        restock: false,
        reason: 'CUSTOMER',
      };

      const cancelResponse = await this.shopifyService.executeGraphQL(
        mutation,
        variables,
        config,
      );

      const errors = cancelResponse?.data?.orderCancel?.userErrors || [];
      if (errors.length > 0) {
        return {
          status: false,
          message: errors[0].message || 'Unable to cancel the order.',
        };
      }

      return { status: true, message: 'Order has been successfully canceled.' };
    } catch (error) {
      console.error('Error in cancelOrder:', error);
      return {
        status: false,
        message: 'An error occurred while attempting to cancel the order.',
      };
    }
  }
  async repeatOrder(
    orderId: string,
    config: any,
  ): Promise<{
    status: boolean;
    message: string;
    draftOrderId?: string;
    invoiceUrl?: string;
  }> {
    // Convert the provided orderId to Shopify Global ID format
    const shopifyOrderId = `gid://shopify/Order/${orderId}`;

    // GraphQL query to fetch order details
    const orderQuery = `
      query GetOrderDetails($orderId: ID!) {
        order(id: $orderId) {
          id
          customer {
            id
          }
          shippingAddress {
            address1
            address2
            city
            country
            countryCode
            zip
          }
          billingAddress {
            address1
            address2
            city
            country
            countryCode
            zip
          }
          lineItems(first: 250) {
            edges {
              node {
                variant {
                  id
                }
                quantity
                customAttributes {
                  key
                  value
                }
              }
            }
          }
        }
      }
    `;

    try {
      // Fetch order details
      const response = await this.shopifyService.executeGraphQL(
        orderQuery,
        { orderId: shopifyOrderId },
        config,
      );

      const orderData = response?.data?.order;
      if (!orderData) {
        return { status: false, message: 'Order not found.' };
      }
      console.log(JSON.stringify(orderData, null, 2));
      const customerId = orderData.customer?.id;
      if (!customerId) {
        return { status: false, message: 'Customer not found for this order.' };
      }

      // Extract line items
      const lineItems = orderData.lineItems.edges.map((edge: any) => ({
        variantId: edge.node.variant.id,
        quantity: edge.node.quantity,
        customAttributes: edge.node.customAttributes,
      }));

      // Draft order input
      const draftOrderInput = {
        customerId,
        lineItems,
        shippingAddress: orderData.shippingAddress,
        billingAddress: orderData.billingAddress,
        useCustomerDefaultAddress: false,
      };

      // GraphQL mutation to create draft order
      const draftOrderMutation = `
        mutation CreateDraftOrder($input: DraftOrderInput!) {
          draftOrderCreate(input: $input) {
            draftOrder {
              id
              invoiceUrl
            }
            userErrors {
              field
              message
            }
          }
        }
      `;

      // Create draft order
      const createResponse = await this.shopifyService.executeGraphQL(
        draftOrderMutation,
        { input: draftOrderInput },
        config,
      );

      const errors = createResponse?.data?.draftOrderCreate?.userErrors || [];
      if (errors.length > 0) {
        return {
          status: false,
          message:
            errors[0].message ||
            "We couldn't create the repeat order. Please contact support.",
        };
      }

      const newDraftOrderId =
        createResponse?.data?.draftOrderCreate?.draftOrder?.id;
      const invoiceUrl =
        createResponse?.data?.draftOrderCreate?.draftOrder?.invoiceUrl;

      return {
        status: true,
        message: 'Repeat order created successfully.',
        draftOrderId: newDraftOrderId,
        invoiceUrl,
      };
    } catch (error) {
      console.error('Error in repeatOrder:', error);
      return {
        status: false,
        message: "We couldn't create the repeat order. Please contact support.",
      };
    }
  }
  generateShippingMessage(
    shipping_standard_cost: string,
    shipping_threshold: string,
    international_shipping_cost: string,
  ): string {
    let message = `*Shipping Charges Information:*\n\n`;
    message += `Hi there!\n`;
    message += `We offer competitive shipping rates to get your order delivered quickly:\n`;

    // If both standard shipping cost and threshold are 0, combine the messages.
    if (shipping_standard_cost === '0' && shipping_threshold === '0') {
      message += `• Enjoy FREE shipping on all orders (3-5 business days)\n`;
    } else {
      // Standard Shipping Message
      if (shipping_standard_cost === '0') {
        message += `• Standard Shipping: FREE (3-5 business days)\n`;
      } else {
        message += `• Standard Shipping: Rs. ${shipping_standard_cost} (3-5 business days)\n`;
      }

      // Shipping Threshold Message
      if (shipping_threshold === '0') {
        message += `Plus, enjoy FREE shipping on all orders!\n`;
      } else {
        message += `Plus, enjoy FREE shipping on orders over Rs. ${shipping_threshold}!\n`;
      }
    }

    // International Shipping (only include if cost is not "0")
    if (international_shipping_cost !== '0') {
      message += `• International Shipping: Rs. ${international_shipping_cost}\n`;
    }

    message += `\nFor more details, visit our website:\n`;
    message += `https://roi-magnet-fashion.myshopify.com/\n\n`;
    message += `Thank you for choosing us!`;

    return message;
  }
}
