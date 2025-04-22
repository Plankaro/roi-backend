import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
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

  async process(job): Promise<void> {
    const { shopify_domain,shopify_Token} = job.data;

    // 1. Fetch your business/store credentials
   
    const payload:any = {
        shopify_Token:shopify_Token,
        shopify_domain:shopify_domain
    }
    const config = getShopifyConfig(payload);


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
    const listResp = await this.shopifyService.executeGraphQL(
      listQuery,
      { first: 250 },
      config,
    );

    if (!listResp?.data?.webhookSubscriptions) {
      this.logger.error('Failed to list webhook subscriptions', listResp);
      return;
    }

    // 3. Identify which subscriptions to delete
    //    e.g. delete all, or only certain topics/callbackUrls
    const toDelete = listResp.data.webhookSubscriptions.edges
      .map(edge => edge.node)
      // example filter: delete only your app’s callbacks
      .filter(node => node.callbackUrl.startsWith(process.env.BACKEND_URL));

    if (toDelete.length === 0) {
      this.logger.log('No matching webhooks to unsubscribe');
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
      const delResp = await this.shopifyService.executeGraphQL(
        deleteMutation,
        { id },
        config,
      );
      const payload = delResp?.data?.webhookSubscriptionDelete;
      if (!payload) {
        this.logger.error(`No response for delete ${id}`, delResp);
        continue;
      }
      if (payload.userErrors.length) {
        this.logger.error(
          `Errors deleting ${id}:`,
          JSON.stringify(payload.userErrors),
        );
      } else {
        this.logger.log(`✅ Deleted subscription ${payload.deletedWebhookSubscriptionId}`);
      }
    }
  }
}
