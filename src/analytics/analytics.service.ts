import { Injectable } from '@nestjs/common';
import { CreateAnalyticsDto } from './dto/create-analytics.dto';
import { UpdateAnalyticsDto } from './dto/update-analytics.dto';
import { DatabaseService } from 'src/database/database.service';
import { ShopifyService } from 'src/shopify/shopify.service';
import { getShopifyConfig } from 'utils/usefulfunction';


import { differenceInDays, isValid,subDays } from 'date-fns';
@Injectable()
export class AnalyticsService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly shopifyService: ShopifyService,
    // private readonly prisma: PrismaClient, // Uncomment if using Prisma Client


  ) {}

  create(createAnalyticsDto: CreateAnalyticsDto) {
    return 'This action adds a new analytics';
  }

  
  async getEcommerceAnalytics(req, query) {
    const user = req.user;
    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);
    const now = new Date();
  
    if (!isValid(startDate) || !isValid(endDate)) {
      throw new Error('Invalid startDate or endDate');
    }
  
   
    
  
    const getOrder = await this.databaseService.linkTrack.findMany({
      where: {
        order_generated:true,
        buisness:{
          id: req.user.business.id
        },
        
        Order:{
          created_at: {
            gte: startDate,
            lte: endDate
          }
        }
      },
      select: {

        Order:{
          select: {
            amount: true,
            created_at: true
          }
        }
      }
    })

    const linksClicked = await this.databaseService.linkTrack.findMany({
      where:{
        last_click:{
          gte:startDate,
          lte:endDate
        }

      },select: {
        no_of_click: true,
        last_click: true,
        first_click: true,
        order_generated:true,
        Order:{
          select:{
            amount:true,
            created_at:true,
          }
        }
      }
    })
    
    const AbondnedCheckout = await this.databaseService.checkout.count({
      where:{
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        completedAt: null
      }
    })
    const recoveredCheckout = await this.databaseService.linkTrack.count({
      where: {
        order_generated: true,
        buisness: {
          id: req.user.business.id
        },
        Order:{
          created_at: {
            gte: startDate,
            lte: endDate,
          },
        },
        Checkout: {
          completedAt: {
            not: null,
          },
        },
      },
    })

    const totalCodtocheckoutlinkSent = await this.databaseService.paymentLink.count({
      where: {
        created_at: {
          gte: startDate,
          lte: endDate,
        },
        business:{
          id: req.user.business.id
        }
      },
      
    })

    const totalCodtocheckoutlinkDelivered = await this.databaseService.paymentLink.count({
      where: {
        created_at: {
          gte: startDate,
          lte: endDate,
        },
        business:{
          id: req.user.business.id
        },
       status:"paid"
      },
      
    })

    return {
      totalCodtocheckoutlinkDelivered,
      totalCodtocheckoutlinkSent,
      AbondnedCheckout,
      recoveredCheckout,
      linksClicked,
      getOrder
    }
    
 
  
  
 
 
  }
async getEngagementAnalytics(req, query) {
  const businessId = req.user.business.id;
  const startDate = new Date(query.startDate);
  const endDate = new Date(query.endDate);

  // Get Shopify config for the business
  const config = getShopifyConfig(req.user.business);


  // Define Shopify GraphQL query to fetch customer count
  const shopifyQuery = `
    query {
      customersCount {
        count
      }
    }
  `;

  try {
    const variables = {};

    // Execute the Shopify GraphQL query
    const shopifyResponse = await this.shopifyService.executeGraphQL(
      shopifyQuery,
      variables,
      config
    );
   
    const customerCount = shopifyResponse?.data?.customersCount?.count;


    // Run database queries concurrently
    const [
      totalMessages,
    
      sessionMessage,
      templateMessage,
      engagementCount,
      failedMessage,
      deliveredMessage,
      sentMessage,
      skippedMessage,
      readMessage,
    ] = await Promise.all([
      // Total messages for the business within the date range
      this.databaseService.chat.count({
        where: {
          Prospect: { business: {id:businessId}},
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      
      // Non-template messages within the date range
      this.databaseService.chat.count({
        where: {
          Prospect: { business: {id:businessId} },
          template_used: false,
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      // Template messages only within the date range
      this.databaseService.chat.count({
        where: {
          Prospect: { business: {id:businessId} },
          template_used: true,
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      // Engagement count as total prospects within the date range
      this.databaseService.prospect.count({
        where: {
          business: {id:businessId},
          created_at: { gte: startDate, lte: endDate },
          chats:{some:{}}
         
        },
      }),
      // Failed messages within the date range
      this.databaseService.chat.count({
        where: {
          Prospect: { business: {id:businessId}  },
          Status: "failed",
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      // Delivered messages within the date range
      this.databaseService.chat.count({
        where: {
          Prospect: { business: {id:businessId} },
          Status: "delivered",
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      // Sent messages within the date range
      this.databaseService.chat.count({
        where: {
          Prospect: { business: {id:businessId} },
          Status: "sent",
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      // Skipped messages within the date range
      this.databaseService.chat.count({
        where: {
          Prospect: { business: {id:businessId} },
          Status: "skipped",
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      // Read messages within the date range
      this.databaseService.chat.count({
        where: {
          Prospect: { business: {id:businessId} },
          Status: "read",
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
    ]);
    


    return {
      customerCount,
     
      totalMessages,
      sessionMessage,
      templateMessage,
      engagementCount,
      failedMessage,
      deliveredMessage,
      sentMessage,
      skippedMessage,
      readMessage
    };
  } catch (error) {
    // Log error and rethrow or handle accordingly
    throw error;
  }
}



async getChatAnalytics(req, query) {
  try {
    const businessId = req.user.business.id;
    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);
    const threeDaysBeforeEnd = subDays(endDate, 3);
  
    const [
      totalMessages,
      automatedMessages,
      totalEngagements,
      abandonedEngagements,
      messagesByAgentsRaw,
    ] = await Promise.all([
      this.databaseService.chat.count({
        where: {
          Prospect: { business: { id: businessId } },
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      this.databaseService.chat.count({
        where: {
          isAutomated: true,
          Prospect: { business: { id: businessId } },
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      this.databaseService.prospect.count({
        where: {
          business: { id: businessId },
          created_at: { gte: startDate, lte: endDate },
        },
      }),
      this.databaseService.prospect.findMany({
        where: {
          business: { id: businessId },
          created_at: { gte: startDate, lte: endDate },
          chats: { some: {} },
        },
        include: {
          chats: {
            where: {
              senderPhoneNo: req.user.business.whatsapp_mobile,
              createdAt: { lte: threeDaysBeforeEnd },

            },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      }),
      this.databaseService.$queryRawUnsafe<
        { senderId: string; senderName: string; messageCount: bigint }[]
      >(
        `
        SELECT 
          u.id AS "senderId", 
          u."name" AS "senderName", 
          COUNT(c.id) AS "messageCount"
        FROM "User" u
        LEFT JOIN "Chat" c 
          ON c."senderId" = u.id 
          AND c."createdAt" BETWEEN $1 AND $2
        GROUP BY u.id, u."name"
        ORDER BY "messageCount" DESC
        `,
        startDate,
        endDate
      ),
    ]);
  
    // Fetch all relevant chat messages
    const chatCount = await this.databaseService.chat.findMany({
      where: {
        senderId: { not: null },
        Prospect: {
          business: { id: businessId },
        },
        isAutomated:{not:true},
        createdAt: { gte: startDate, lte: endDate }, // respect date filter
      },
      select: {
        template_used: true,
        body_text: true,
      },
    });
  
    // Total message time calculation
    const totalMessageTime = chatCount.reduce((total, chat) => {
      if (chat.template_used) {
        return total + 1;
      }
  
      const bodyLength = chat.body_text?.length || 0;
      const timeForBody = Math.ceil(bodyLength / 100);
      return total + timeForBody;
    }, 0);

  
    const messagesByAgents = messagesByAgentsRaw.map(agent => ({
      ...agent,
      messageCount: Number(agent.messageCount),
    }));
  
    return {
      totalMessages,
      automatedMessages,
      totalEngagements,
      abandonedEngagements,
      messagesByAgents,
      totalMessageTime, // ⏱️ add this to your analytics
    };
  } catch (error) {
    console.error(error);
  }
}






}