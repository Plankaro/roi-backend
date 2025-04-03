import { Injectable } from '@nestjs/common';
import { CreateAnalyticsDto } from './dto/create-analytics.dto';
import { UpdateAnalyticsDto } from './dto/update-analytics.dto';
import { DatabaseService } from 'src/database/database.service';
import { ShopifyService } from 'src/shopify/shopify.service';
import { getShopifyConfig } from 'utils/usefulfunction';


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
    const getOrderAnalytics = await this.databaseService.order.findMany({
      where: {
        buisnessId: user.business.id,
        BroadCastId: { not: null },
        created_at:{
          gte: new Date(query.startDate),
          lte: new Date(query.endDate),
        }
      },
      
    });
    const getAbondnedCheckoutanalytics = await this.databaseService.checkoutOnCampaign.findMany({
      where: {
        campaign: {
          businessId: user.business.id, 
          createdAt: {
            gte: new Date(query.startDate),
            lte: new Date(query.endDate),
          }// Directly referencing the businessId
        },
      },
      include: {
        checkout: {
          include: {
            Order: true, // Ensuring Orders are included properly
          },
        },
      },
    });
    
    const getCodToCheckoutAnalytics = await this.databaseService.paymentLink.findMany({
      where: {
        businessId: user.business.id,
        created_at:{
          gte: new Date(query.startDate),
          lte: new Date(query.endDate),
        }
      },
      
      include: {
        order: true,
      }
  })

    return { getOrderAnalytics, getAbondnedCheckoutanalytics, getCodToCheckoutAnalytics };
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
    const customerCount = shopifyResponse.data.customersCount.count;

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
    ] = await Promise.all([
      // Total messages for the business within the date range
      this.databaseService.chat.count({
        where: {
          Prospect: { business: businessId },
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      // Non-template messages within the date range
      this.databaseService.chat.count({
        where: {
          Prospect: { business: businessId },
          template_used: false,
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      // Template messages only within the date range
      this.databaseService.chat.count({
        where: {
          Prospect: { business: businessId },
          template_used: true,
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      // Engagement count as total prospects within the date range
      this.databaseService.prospect.count({
        where: {
          business: businessId,
         
        },
      }),
      // Failed messages within the date range
      this.databaseService.chat.count({
        where: {
          Prospect: { business: businessId },
          Status: "failed",
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      // Delivered messages within the date range
      this.databaseService.chat.count({
        where: {
          Prospect: { business: businessId },
          Status: "delivered",
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      // Sent messages within the date range
      this.databaseService.chat.count({
        where: {
          Prospect: { business: businessId },
          Status: "sent",
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      // Skipped messages within the date range
      this.databaseService.chat.count({
        where: {
          Prospect: { business: businessId },
          Status: "skipped",
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
    };
  } catch (error) {
    // Log error and rethrow or handle accordingly
    throw error;
  }
}

async getChatAnalytics(req,query){
  const businessId = req.user.business.id;
  const startDate = new Date(query.startDate);
  const endDate = new Date(query.endDate);

  const totalMessages = await this.databaseService.chat.count({
    where: {
      Prospect: { business: businessId },
      createdAt: { gte: startDate, lte: endDate },
    },
  });

  const automatedMessages = await this.databaseService.chat.count({
    where:{
      isAutomated: true,
      createdAt: { gte: startDate, lte: endDate },
    }
  })

  const getMessagesByAgents = await this.databaseService.chat.groupBy({
    by:["prospectId"],
    _count: {
      _all: true
    },
    where: {
      createdAt: { gte: startDate, lte: endDate },
    },
  })

}

}