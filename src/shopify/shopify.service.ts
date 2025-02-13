import { BadRequestException, Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import path from 'path';

@Injectable()
export class ShopifyService {
  private readonly client: AxiosInstance;

  constructor() {
    const store = process.env.SHOPIFY_STORE;
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

    if (!store || !accessToken) {
      throw new Error('Shopify store or access token is not configured.');
    }

    this.client = axios.create({
      baseURL: `https://${store}/admin/api/2025-01`,
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });
  }

  async executeGraphQL(query: string, variables: object = {}) {
    try {
      const response = await this.client.post('/graphql.json', {
        query,
        variables,
      });
  
     
      return response.data;

    } catch (error) {
      console.error(error);
      throw new Error(`GraphQL query failed: ${error.message}`);
    }
  }
  async query(pathname: string): Promise<any> {
    try {
      const response = await this.client.get(pathname); // Use GET for fetching data
      return response.data;
    } catch (error) {
      throw new Error(`REST query failed: ${error.response?.data?.errors || error.message}`);
    }
  }

  // Add more methods to query specific GraphQL endpoints
}


