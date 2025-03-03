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
    console.log('getAllCustomers called');
    console.log('getAllCustomers called with request:', req);

    const buisness = req?.user?.business;
    console.log(buisness)


    // const config = {
    //   store: 'roi-magnet-fashion.myshopify.com',
    //   accessToken: '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',
    // };
    const config = getShopifyConfig(buisness);
    console.log('Shopify config:', config);

    const query = `
      query {
        customers(first: 250) {
          edges {
            cursor
            node {
              id
              firstName
              lastName
              email
              displayName
              phone
              amountSpent {
                amount
                currencyCode
              }
            }
          }
          pageInfo {
            hasNextPage
          }
        }
          customersCount {
            count
              
            }
      }
    `;
    console.log('GraphQL query:', query);

    try {
      const variables = {};
      console.log('GraphQL variables:', variables);

      const response = await this.shopifyService.executeGraphQL(query, variables, config);
      console.log('Raw Shopify response:', response);

      if (!response || !response.data || !response.data.customers) {
        console.error('Invalid Shopify response structure:', response);
        throw new NotFoundException('No customers found');
      }

      // Extract customer data from Shopify response
      const shopifyCustomers = response.data.customers.edges.map(({ node }) => {
        const numericIdMatch = node.id.match(/\d+$/);
        const shopify_id = numericIdMatch ? numericIdMatch[0] : null;
        console.log('Extracted customer node:', {
          shopify_id,
          name: `${node.firstName || ''} ${node.lastName || ''}`.trim(),
        });
        return {
          shopify_id,
          name: node.displayName || '',
          email: node.email || '',
          phone: node.phone || '',
          amountSpent: node.amountSpent,
        };
      });
      console.log(`Extracted ${shopifyCustomers.length} Shopify customers`);

      // Get matching prospects from the database
      const shopifyIds = shopifyCustomers.map((c) => c.shopify_id).filter(Boolean);
      console.log('Shopify IDs to search in DB:', shopifyIds);

      const existingProspects = await this.databaseService.prospect.findMany({
        where: {
          shopify_id: { in: shopifyIds },
        },
        select: {
          id: true,
          shopify_id: true,
          name: true,
          email: true,
          phoneNo: true,
          image: true,
          last_Online: true,
          is_blocked: true,
          created_at: true,
          updated_at: true,
          lead: true,
        },
      });
      console.log(`Found ${existingProspects.length} matching prospects in the database`, existingProspects);

      // Get starred customers
      const starredCustomers = await this.databaseService.starredCustomers.findMany({
        where: {
          shopify_id: { in: shopifyIds },
        },
        select: {
          shopify_id: true,
        },
      });


      console.log('Starred customers:', starredCustomers);

      // Create a mapping of shopify_id -> prospect data
      const prospectMap = new Map(existingProspects.map((p) => [p.shopify_id, p]));

      // Create a Set of starred shopify_ids for quick lookup
      const starredSet = new Set(starredCustomers.map((s) => s.shopify_id));

      // Merge Shopify customer data with corresponding Prospect data
      const result = shopifyCustomers.map((customer) => {
        const prospectData = prospectMap.get(customer.shopify_id) || null;
        const starredContact = starredSet.has(customer.shopify_id);
        console.log('Merging data for customer:', customer.shopify_id, 'Prospect:', prospectData, 'Starred:', starredContact);

        return {
          shopifyCustomer: customer,
          prospectData,
          starredContact,
        };
      });

      console.log('Final merged result:', result);
      return {customers:result,CustomerContact:response?.data?.customersCount?.count};
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw new InternalServerErrorException(error);
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
      displayName
      email
      numberOfOrders
      phone
      amountSpent {
        amount
        currencyCode
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

    const getProspect = await this.databaseService.prospect.findUnique({
      where: { shopify_id: customerId },
    });
    
    const response = await this.shopifyService.executeGraphQL(query, variables, config);
    
    let totalMessages = 0, sentMessages = 0, receivedMessages = 0, readMessages = 0;
    
    if (getProspect) {
        [totalMessages, sentMessages, receivedMessages, readMessages] = await Promise.all([
            this.databaseService.chat.count({
                where: { prospectId: getProspect.id },
            }),
            this.databaseService.chat.count({
                where: {
                    senderPhoneNo: getProspect.phoneNo,
                    receiverPhoneNo: buisness.whatsapp_mobile,
                },
            }),
            this.databaseService.chat.count({
                where: {
                    receiverPhoneNo: getProspect.phoneNo,
                    senderPhoneNo: buisness.whatsapp_mobile,
                },
            }),
            this.databaseService.chat.count({
                where: {
                    receiverPhoneNo: getProspect.phoneNo,
                    Status: 'read',
                },
            }),
        ]);
    }
    
    console.log(JSON.stringify(response.data, null, 2)); // Log the response
    return {
        shopifyData: response.data.customer,
        DbData: getProspect || null,
        totalMessages,
        sentMessages,
        receivedMessages,
        readMessages
    };
}


  async getAllSegments(
    req: any,
  ): Promise<
    { id: string; name: string; query: string; totalContacts: number }[]
  > {
    console.log(req.user);
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
    const business = await req.user.business;

    const config = getShopifyConfig(business);

    // Retrieve all segments first
    const segments = await this.getAllSegments(req);
    // const cacheKey = `shopify:segments:${config.store}`;
    // const cachedData = await this.redis.get(cacheKey);
    // if (cachedData) {
    //   console.log('Returning cached data');
    //   return JSON.parse(cachedData);
    // }

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
    // await this.redis.set(cacheKey, JSON.stringify(segmentsWithCounts));

    return segmentsWithCounts;
  }

  async getAllContactsForSegment(segmentId: string, req: any): Promise<any[]> {
    let contacts: any[] = [];
    let hasNextPage = true;
    let after: string = null;
    const first = 250;

    // Retrieve the business configuration
    const config = getShopifyConfig(req?.user?.business ?? req?.business ?? {});

    // Define the GraphQL query
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
      // Loop to fetch all pages
      while (hasNextPage) {
        const variables = {
          segmentId: `gid://shopify/Segment/${segmentId}`,
          first,
          after,
        };
        const result = await this.shopifyService.executeGraphQL(
          query,
          variables,
          config,
        );

        // Log variables for logging
        console.log('Variables:', variables);

        // Check for GraphQL errors
        if (result.errors && result.errors.length) {
          console.error('GraphQL errors:', result.errors);
          throw new InternalServerErrorException(
            result.errors[0].message || 'Failed to get data',
          );
        }

        // Extract members connection
        const membersConnection = result.data?.customerSegmentMembers;
        if (!membersConnection) {
          break;
        }

        // Extract edges and append nodes to contacts
        const edges = membersConnection.edges || [];
        const nodes = edges.map((edge) => {
          const {
            displayName,
            firstName,
            id,
            lastName,
            defaultEmailAddress,
            defaultPhoneNumber,
          } = edge.node;
          return {
            displayName,
            firstName,
            id,
            lastName,
            email: defaultEmailAddress?.emailAddress || null,
            phone: defaultPhoneNumber?.phoneNumber || null,
          };
        });
        contacts = contacts.concat(nodes);

        // Update pagination info
        hasNextPage = membersConnection.pageInfo.hasNextPage;
        after = membersConnection.pageInfo.endCursor;
      }

      return contacts;
    } catch (error) {
      console.error('Error in getAllContactsForSegment:', error);
      throw new InternalServerErrorException({ message: error.message });
    }
  }

  async getCustomerByPhone(phone: string, req: any): Promise<any> {
    try {
      const query = `
        query GetCustomerByPhone($phoneNumber: String!) {
          customerByIdentifier(identifier: { phoneNumber: $phoneNumber }) {
            id
            firstName
            lastName
            displayName
            phone
            email
          }
        }
      `;

      const variables = { phoneNumber: phone };
      const config = getShopifyConfig(
        req?.user?.business ?? req?.business ?? {},
      );

      const customer = await this.shopifyService.executeGraphQL(
        query,
        variables,
        config,
      );

      return customer.data.customerByIdentifier;
    } catch (error) {
      console.error('Error fetching customer:', error);
      throw new InternalServerErrorException(error);
    }
  }
}
