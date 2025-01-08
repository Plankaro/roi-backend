import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { ShopifyService } from 'src/shopify/shopify.service';
@Injectable()
export class CustomersService {
  constructor(private readonly shopifyService: ShopifyService) {}

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
      console.log(response);
      // Validate response structure
      if (!response || !response.data || !response.data.customers) {
        throw new InternalServerErrorException(
          'Failed to fetch products from Shopify',
        );
      }

      return response;
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
  
    const response = this.shopifyService.executeGraphQL(query,variables);
  
  
    return response;
  }

  update(id: number, updateCustomerDto: UpdateCustomerDto) {
    return `This action updates a #${id} customer`;
  }

  remove(id: number) {
    return `This action removes a #${id} customer`;
  }
}
