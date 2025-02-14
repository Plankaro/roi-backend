import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class ShopifyService {
  /**
   * Create an Axios client using the provided store and access token.
   */
  private createClient(store: string, accessToken: string): AxiosInstance {
    return axios.create({
      baseURL: `https://${store}/admin/api/2025-01`,
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Executes a GraphQL query on Shopify.
   * @param query The GraphQL query string.
   * @param variables Optional variables for the query.
   * @param config Object containing the Shopify store and access token.
   */
  async executeGraphQL(
    query: string,
    variables: object = {},
    config: { store: string; accessToken: string }
  ): Promise<any> {
    try {
      const client = this.createClient(config.store, config.accessToken);
      const response = await client.post('/graphql.json', {
        query,
        variables,
      });
      return response.data;
    } catch (error: any) {
      console.error('GraphQL query failed:', error?.response?.data || error.message);
      throw new InternalServerErrorException(`GraphQL query failed: ${error.message}`);
    }
  }

  /**
   * Executes a REST GET query on Shopify.
   * @param pathname The REST endpoint path.
   * @param config Object containing the Shopify store and access token.
   */
  async query(
    pathname: string,
    config: { store: string; accessToken: string }
  ): Promise<any> {
    try {
      const client = this.createClient(config.store, config.accessToken);
      const response = await client.get(pathname);
      return response.data;
    } catch (error: any) {
      console.error('REST query failed:', error?.response?.data?.errors || error.message);
      throw new InternalServerErrorException(
        `REST query failed: ${error.response?.data?.errors || error.message}`
      );
    }
  }

  // You can add more Shopify-specific methods here, each accepting configuration as parameters.
}
