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
    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);
    const now = new Date();
  
    if (!isValid(startDate) || !isValid(endDate)) {
      throw new Error('Invalid startDate or endDate');
    }
  
    const isToday = endDate.toDateString() === now.toDateString();
    const effectiveEndDate = isToday ? now : endDate;
  
    const dayDiff = differenceInDays(effectiveEndDate, startDate);
  
    let groupByClause = `DATE("created_at")`;
    let formatClause = `TO_CHAR(DATE("created_at"), 'YYYY-MM-DD')`;
  
    if (dayDiff > 365 * 3) {
      groupByClause = `DATE_TRUNC('year', "created_at")`;
      formatClause = `TO_CHAR(DATE_TRUNC('year', "created_at"), 'YYYY')`;
    } else if (dayDiff > 180) {
      groupByClause = `DATE_TRUNC('month', "created_at")`;
      formatClause = `TO_CHAR(DATE_TRUNC('month', "created_at"), 'YYYY-MM')`;
    }
  
    const groupedOrders: any = await this.databaseService.$queryRawUnsafe(
      `
      SELECT 
        ${formatClause} AS order_date,
        COUNT(*) AS order_count,
        SUM(CAST("amount" AS numeric)) AS total_revenue
      FROM "Order"
      WHERE 
        "created_at" >= $1
        AND "created_at" <= $2
      GROUP BY ${groupByClause}
      ORDER BY ${groupByClause};
      `,
      startDate, // ✅ PASS AS DATE OBJECT
      effectiveEndDate // ✅ PASS AS DATE OBJECT
    );
  
    const result = groupedOrders.map((row: any) => ({
      order_date: row.order_date,
      order_count: Number(row.order_count),
      total_revenue: parseFloat(row.total_revenue),
    }));
  
    console.log(groupedOrders)
    return { result };
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
    console.log(shopifyResponse)
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
  const businessId = req.user.business.id;
  const business = req.user;
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
    // Total messages within time range
    this.databaseService.chat.count({
      where: {
        Prospect: { business: { id: businessId } },
        createdAt: { gte: startDate, lte: endDate },
      },
    }),

    // Automated messages
    this.databaseService.chat.count({
      where: {
        isAutomated: true,
        Prospect: { business: { id: businessId } },
        createdAt: { gte: startDate, lte: endDate },
      },
    }),

    // Prospects with any chat
    this.databaseService.prospect.count({
      where: {
        business: { id: businessId },
        created_at: { gte: startDate, lte: endDate },
        chats: { some: {} },
      },
    }),

    // Abandoned engagements (last message sent more than 3 days before endDate)
    this.databaseService.prospect.findMany({
      where: {
        business: { id: businessId },
        created_at: { gte: startDate, lte: endDate },
        chats: { some: {} },
      },
      include: {
        chats: {
          where: {
            senderPhoneNo: business.whatsapp_mobile,
            createdAt: { lte: threeDaysBeforeEnd },
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    }),

    // Messages by agents – using LEFT JOIN to include users with zero messages
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

  // Convert BigInt messageCount to a regular number
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
  };
}




}