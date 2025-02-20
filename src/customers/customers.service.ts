import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { ShopifyService } from 'src/shopify/shopify.service';
import { DatabaseService } from 'src/database/database.service';
import { getShopifyConfig } from 'utils/usefulfunction';
import { console } from 'inspector';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
@Injectable()
export class CustomersService {
  constructor(
    private readonly shopifyService: ShopifyService,
    private readonly databaseService: DatabaseService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  create(createCustomerDto: CreateCustomerDto, req: any) {
    return 'This action adds a new customer';
  }

  async getAllCustomers(req: any) {
    const buisness = req.user.business;
    const config = getShopifyConfig(buisness);
    const query = `
    query ($cursor: String) {
      customers(first: 50, after: $cursor) {
        edges {
          cursor
          node {
            id
            addresses {
              address1
              address2
              city
              country
              countryCode
              zip
            }
            amountSpent {
              amount
              currencyCode
            }
            email
            firstName
            lastName
            phone
            image {
              url
              src
            }
            orders(first: 5) {
              nodes {
                closed
                closedAt
                id
                totalPriceSet {
                  shopMoney {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
        pageInfo {
          hasNextPage
        }
      }
    }
  `;
    try {
      const variable = {};
      const response = await this.shopifyService.executeGraphQL(
        query,
        variable,
        config,
      );

      // Validate response structure
      if (!response || !response.data || !response.data.customers) {
        throw new NotFoundException('no customers found');
      }
      const existingCustomers = await this.databaseService.prospect.findMany({
        select: {
          shopify_id: true,
        },
      });

      const existingCustomerIds = new Set(
        existingCustomers.map((customer) => customer.shopify_id),
      );
      const filteredData = response.data.customers.edges
        .filter(
          ({ node }) => !existingCustomerIds.has(node.id.match(/\d+$/)[0]),
        ) // Exclude matching IDs
        .map(({ node }) => ({
          id: node.id,
          name: `${node.firstName || ''} ${node.lastName || ''}`.trim(),
          email: node.email || '',
          phone: node.phone || '',
          address: node.addresses.map((address) => ({
            address1: address.address1 || '',
            address2: address.address2 || '',
            city: address.city || '',
            country: address.country || '',
            zip: address.zip || '',
          })),
          amountSpent: node.amountSpent,
          orders: node.orders.nodes,
          image: node.image?.url || '', // Handle cases where image might be null
        }));

      return filteredData;
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred while fetching products',
      );
    }
  }

  async getCustomerById(customerId: string, req: any) {
    const buisness = req.user.business;
    const config = getShopifyConfig(buisness);
    const query = `
  query ($id: ID!) {
    customer(id: $id) {
      id
      firstName
      lastName
      email
      image {
        url
        src
      }
      phone
      amountSpent {
        amount
        currencyCode
      }
      orders(first: 5) {
        nodes {
          id
          name
          totalPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          createdAt
          
        
        }
      }
      addresses {
        address1
        address2
        city
        country
        zip
      }
    }
  }
`;

    const variables = { id: `gid://shopify/Customer/${customerId}` };

    const response = await this.shopifyService.executeGraphQL(
      query,
      variables,
      config,
    );

    console.log(JSON.stringify(response.data, null, 2)); // Log the response)
    return response.data.customer;
  }

  async getAllSegments(
    req: any,
  ): Promise<
    { id: string; name: string; query: string; totalContacts: number }[]
  > {
    const business = req.user.business;
    const config = getShopifyConfig(business);
    const query = `
      query GetAllSegments($first: Int!) {
        segments(first: $first) {
          edges {
            node {
              id
              name
              query
              
            }
          }
        }
      }
    `;
    const variables = { first: 250 };
    const result = await this.shopifyService.executeGraphQL(
      query,
      variables,
      config,
    );
    const segmentsEdges = result.data?.segments?.edges || [];
    console.log(result);
    return segmentsEdges.map((edge: any) => ({
      id: edge.node.id,
      name: edge.node.name,
      query: edge.node.query,
      totalContacts: edge.node.contacts?.totalCount || 0,
    }));
  }
  async getSegmentsWithCustomerCounts(
    req: any,
  ): Promise<
    { id: string; name: string; query: string; totalCount: number }[]
  > {
    const business = req.user.business;
    const config = getShopifyConfig(business);

    // Retrieve all segments first
    const segments = await this.getAllSegments(req);
    const cacheKey = `shopify:segments:${config.store}`;
    const cachedData = await this.redis.get(cacheKey);
    if (cachedData) {
      console.log('Returning cached data');
      return JSON.parse(cachedData);
    }

    // For each segment, run a query to get its customer count
    const segmentsWithCounts = await Promise.all(
      segments.map(async (segment) => {
        const customerCountQuery = `
          query GetSegmentMembers($segmentId: ID!, $first: Int!, $after: String) {
            customerSegmentMembers(segmentId: $segmentId, first: $first, after: $after) {
              totalCount
            }
          }
        `;
        const variables = { segmentId: segment.id, first: 1, after: null };
        const response = await this.shopifyService.executeGraphQL(
          customerCountQuery,
          variables,
          config,
        );
        const totalCount =
          response.data?.customerSegmentMembers?.totalCount ?? 0;
        return {
          id: segment.id,
          name: segment.name,
          query: segment.query,
          totalCount,
        };
      }),
    );
    await this.redis.set(cacheKey, JSON.stringify(segmentsWithCounts));

    return segmentsWithCounts;
  }

  async getAllContactsForSegment(segmentId: string, req: any): Promise<any[]> {
    let contacts: any[] = [];
    let hasNextPage = true;
    let after: string = null;
    const first = 250;
    const buisness = req.user.business;
    const config = getShopifyConfig(buisness);
    const query = `
      query GetSegmentMembers($segmentId: ID!, $first: Int!, $after: String) {
        customerSegmentMembers(segmentId: $segmentId, first: $first, after: $after) {
          totalCount
          edges {
            node {
              displayName
        firstName
        id
        lastName
        defaultEmailAddress {
          emailAddress
        }
        defaultPhoneNumber {
          phoneNumber
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

    try {
      while (hasNextPage) {
        const variables = { segmentId, first, after };
        const result = await this.shopifyService.executeGraphQL(
          query,
          variables,
          config,
        );
        // Log any errors if present:
        if (result.errors && result.errors.length) {
          console.error('GraphQL errors:', result.errors);
          throw new InternalServerErrorException(
            result.errors[0].message || 'Failed to get data',
          );
        }
        const membersConnection = result.data?.customerSegmentMembers;
        if (!membersConnection) {
          break;
        }
        const edges = membersConnection.edges || [];
        contacts = 
        hasNextPage = membersConnection.pageInfo.hasNextPage;
        after = membersConnection.pageInfo.endCursor;
      }
      return contacts;
    } catch (error) {
      console.error('Error in getAllContactsForSegment:', error);
      throw new InternalServerErrorException({ message: error.message });
    }
  }
  update(id: number, updateCustomerDto: UpdateCustomerDto) {
    return `This action updates a #${id} customer`;
  }

  remove(id: number) {
    return `This action removes a #${id} customer`;
  }
}
