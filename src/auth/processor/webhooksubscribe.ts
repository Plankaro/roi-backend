import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { getShopifyConfig } from 'utils/usefulfunction';
import { ShopifyService } from 'src/shopify/shopify.service';

@Injectable()
@Processor('webhookSubscribe')
export class WebhookSubscribe extends WorkerHost {
  private readonly logger = new Logger(WebhookSubscribe.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly shopifyService: ShopifyService,
  ) {
    super();
  }

  async process(job: Job<{ buisness_id: string }>): Promise<void> {
    const { buisness_id } = job.data;
    const business = await this.databaseService.business.findUnique({
      where: { id: buisness_id },
    });
    if (!business) {
      throw new InternalServerErrorException(
        `Business ${buisness_id} not found`,
      );
    }

    const config = getShopifyConfig(business);

    // Define the topics you want to subscribe to, and the corresponding path on your backend
    const subscriptions = [
      { topic: 'ORDERS_CREATE', path: '/events/createOrder' },
      { topic: 'CHECKOUTS_CREATE', path: '/events/checkout' },
      { topic: 'FULFILLMENTS_UPDATE', path: '/events/updateFulfillment' },
      { topic: 'CHECKOUTS_UPDATE', path: '/events/updateCheckout' },
      { topic: 'ORDERS_CANCELLED', path: '/events/cancelOrder' },
      { topic: 'FULFILLMENTS_CREATE', path: '/events/createFulfillment' },
      { topic: 'ORDERS_UPDATED', path: '/events/updateOrder' }, // ← corrected
      { topic: 'APP_UNINSTALLED', path: '/events/appUninstall' },
    ];

    // Make sure BACKENDURL has no trailing slash
    const baseUrl = (process.env.BACKEND_URL || '').replace(/\/+$/, '');

    const mutation = `
      mutation webhookSubscriptionCreate(
        $topic: WebhookSubscriptionTopic!, 
        $webhookSubscription: WebhookSubscriptionInput!
      ) {
        webhookSubscriptionCreate(
          topic: $topic, 
          webhookSubscription: $webhookSubscription
        ) {
          webhookSubscription { id, callbackUrl,topic }
          userErrors { field, message }
        }
      }
    `;

    for (const { topic, path } of subscriptions) {
      const callbackUrl = `${baseUrl}${path}`;

      const variables = {
        topic,
        webhookSubscription: { callbackUrl },
      };

      this.logger.log(`Registering webhook for ${topic} → ${callbackUrl}`);
      const resp = await this.shopifyService.executeGraphQL(
        mutation,
        variables,
        config,
      );
   

      // guard against network/parse errors
      if (!resp?.data?.webhookSubscriptionCreate) {
        this.logger.error(`No data returned for ${topic}`, resp);
        continue;
      }

      const { userErrors, webhookSubscription } =
        resp.data.webhookSubscriptionCreate;
      if (userErrors.length > 0) {
        this.logger.error(
          `Failed to create ${topic} webhook:`,
          JSON.stringify(userErrors),
        );
      } else {
        this.logger.log(
          `✅ Subscribed ${topic}: ${webhookSubscription.id} @ ${webhookSubscription.callbackUrl}`,
        );
        // Optionally persist the subscription ID in your own DB
      }
    }

    const listSubscriptionsQuery = /* GraphQL */ `
      query webhookSubscriptions($first: Int!) {
        webhookSubscriptions(first: $first) {
          edges {
            node {
              id
              topic
              callbackUrl
            }
          }
        }
      }
    `;
    const listResponse = await this.shopifyService.executeGraphQL(
        listSubscriptionsQuery,
        { first: subscriptions.length }, // or a safe max like 50
        config,
      
    );
 
  }
}
