import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ShopifyService } from 'src/shopify/shopify.service';

@Injectable()
export class OrdersService {
  constructor(private readonly shopifyService: ShopifyService) {}
  async create(CreateOrderDto: any) {
    console.log(CreateOrderDto);
    const { customerId, Items } = CreateOrderDto;
    const variables = {
      customerId: customerId, // This must be a valid Shopify Customer global ID
      order: {
        currency: 'INR', // Ensure this matches Shopify's supported currencies
        lineItems: Items.map((item) => ({
          variantId: item.productId, // This must be a valid Shopify Product Variant global ID
          quantity: item.quantity, // Must be a positive integer
        })),
      },
    };

    const query = `
    mutation OrderCreate($order: OrderCreateOrderInput!, $options: OrderCreateOptionsInput) {
      orderCreate(order: $order, options: $options) {
        userErrors {
          field
          message
        }
        order {
          id
          currentTotalPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          currentSubtotalPriceSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          currentTotalTaxSet {
            shopMoney {
              amount
              currencyCode
            }
          }
          transactions {
            kind
            status
            amountSet {
              shopMoney {
                amount
                currencyCode
              }
            }
          }
          lineItems(first: 5) {
            nodes {
              variant {
                id
              }
              id
              title
              quantity
              taxLines {
                title
                rate
                priceSet {
                  shopMoney {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

    try {
      const response = await this.shopifyService.executeGraphQL(
        query,
        variables,
      );
      console.log(response);
      return { response, variables };
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
    return variables;
  }

  findAll() {
    return `This action returns all orders`;
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
