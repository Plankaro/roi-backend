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
@Injectable()
export class CustomersService {
  constructor(
    private readonly shopifyService: ShopifyService,
    private readonly databaseService: DatabaseService,
  ) {}

  create(createCustomerDto: CreateCustomerDto) {
    return 'This action adds a new customer';
  }

  async getAllCustomers() {
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
              amountSpent {
        amount
        currencyCode
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
      const response = await this.shopifyService.executeGraphQL(query);

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

  async getCustomerById(customerId: string) {
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

    const response = await this.shopifyService.executeGraphQL(query, variables);
    // const filteredData = response.data.customers.edges
    // .map(({ node }) => ({
    //   id: node.id,
    //   name: `${node.firstName || ''} ${node.lastName || ''}`.trim(),
    //   email: node.email || '',
    //   phone: node.phone || '',
    //   address: node.addresses.map((address) => ({
    //     address1: address.address1 || '',
    //     address2: address.address2 || '',
    //     city: address.city || '',
    //     country: address.country || '',
    //     zip: address.zip || '',
    //   })),
    //   amountSpent: node.amountSpent,
    //   orders: node.orders.nodes,
    //   image: node.image?.url || '', // Handle cases where image might be null
    // }));
    return response.data.customer;
  }

  async getAllSegments(): Promise<{ id: string; name: string }[]> {
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
    const result = await this.shopifyService.executeGraphQL(query, variables);
    const segmentsEdges = result.data?.segments?.edges || [];
    return segmentsEdges.map((edge: any) => ({
      id: edge.node.id,
      name: edge.node.name,
      query: edge.node.query,
    }));
  }

  async getAllContactsForSegment(segmentId: string): Promise<any[]> {
    let contacts: any[] = [];
    let hasNextPage = true;
    let after: string = null;
    const first = 250;
  
    const query = `
      query GetSegmentMembers($segmentId: ID!, $first: Int!, $after: String) {
        customerSegmentMembers(segmentId: $segmentId, first: $first, after: $after) {
          totalCount
          edges {
            node {
              id
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
        const result = await this.shopifyService.executeGraphQL(query, variables);
        // Log any errors if present:
        if (result.errors && result.errors.length) {
          console.error('GraphQL errors:', result.errors);
          throw new InternalServerErrorException(result.errors[0].message || "Failed to get data");
        }
        const membersConnection = result.data?.customerSegmentMembers;
        if (!membersConnection) {
          break;
        }
        const edges = membersConnection.edges || [];
        contacts = contacts.concat(
          edges.map((edge: any) =>
            edge.node.defaultPhoneNumber ? edge.node.defaultPhoneNumber.phoneNumber : null
          ).filter((phone: string | null): phone is string => phone !== null)
        );
        hasNextPage = membersConnection.pageInfo.hasNextPage;
        after = membersConnection.pageInfo.endCursor;
      }
      return contacts;
    } catch (error) {
      console.error("Error in getAllContactsForSegment:", error);
      throw new InternalServerErrorException({message:error.message});
    }
  }
  update(id: number, updateCustomerDto: UpdateCustomerDto) {
    return `This action updates a #${id} customer`;
  }

  remove(id: number) {
    return `This action removes a #${id} customer`;
  }
}
