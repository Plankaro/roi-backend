import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { getShopifyConfig } from 'utils/usefulfunction';
import { ShopifyService } from 'src/shopify/shopify.service';

@Injectable()
@Processor('webhookUnsubscribe')
export class WebhookUnsubscribe extends WorkerHost {
  private readonly logger = new Logger(WebhookUnsubscribe.name);

  constructor(
    private readonly databaseService: DatabaseService,
    private readonly shopifyService: ShopifyService,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    console.log('Starting WebhookUnsubscribe job with data:', job.data);

    const { shopify_domain, shopify_Token } = job.data;

    const payload: any = {
      shopify_Token: shopify_Token,
      shopify_domain: shopify_domain,
    };
    const config = getShopifyConfig(payload);

    console.log('Generated Shopify config:', config);

    // 2. List existing subscriptions
    const listQuery = /* GraphQL */ `
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

    console.log('Sending request to list webhook subscriptions...');
    const listResp = await this.shopifyService.executeGraphQL(
      listQuery,
      { first: 250 },
      config,
    );

    console.log('List response:', JSON.stringify(listResp));

    if (!listResp?.data?.webhookSubscriptions) {
      this.logger.error('Failed to list webhook subscriptions', listResp);
      console.error('Webhook subscriptions missing in response.');
      return;
    }

    // 3. Identify which subscriptions to delete
    const allSubscriptions = listResp.data.webhookSubscriptions.edges.map(edge => edge.node);
    console.log('All subscriptions found:', allSubscriptions.length);

    const toDelete = allSubscriptions
      .filter(node => node.callbackUrl.startsWith(process.env.BACKEND_URL));

    console.log('Subscriptions to delete:', toDelete.length);

    if (toDelete.length === 0) {
      this.logger.log('No matching webhooks to unsubscribe');
      console.log('No webhooks matched the deletion filter.');
      return;
    }

    // 4. Delete each one
    const deleteMutation = /* GraphQL */ `
      mutation webhookSubscriptionDelete($id: ID!) {
        webhookSubscriptionDelete(id: $id) {
          deletedWebhookSubscriptionId
          userErrors {
            field
            message
          }
        }
      }
    `;

    for (const { id, topic, callbackUrl } of toDelete) {
      this.logger.log(`Deleting webhook ${topic} @ ${callbackUrl} (ID: ${id})`);
      console.log(`Attempting to delete webhook ID: ${id}, topic: ${topic}`);

      const delResp = await this.shopifyService.executeGraphQL(
        deleteMutation,
        { id },
        config,
      );

      console.log('Delete response:', JSON.stringify(delResp));

      const payload = delResp?.data?.webhookSubscriptionDelete;
      if (!payload) {
        this.logger.error(`No response for delete ${id}`, delResp);
        console.error(`Missing delete payload for ID: ${id}`);
        continue;
      }
      if (payload.userErrors.length) {
        this.logger.error(
          `Errors deleting ${id}:`,
          JSON.stringify(payload.userErrors),
        );
        console.error(`Errors occurred deleting webhook ID: ${id}`, payload.userErrors);
      } else {
        this.logger.log(`✅ Deleted subscription ${payload.deletedWebhookSubscriptionId}`);
        console.log(`✅ Successfully deleted subscription: ${payload.deletedWebhookSubscriptionId}`);
      }
    }

    console.log('WebhookUnsubscribe job completed.');
  }
}
