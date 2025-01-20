import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ShopifyService } from 'src/shopify/shopify.service';

@Injectable()
export class OrdersService {
  constructor(private readonly shopifyService: ShopifyService) {}
  async create(CreateOrderDto: CreateOrderDto) {
    const {customerId,variantId,quantity}=CreateOrderDto
    const variables = {
      order: {
        currency: "EUR",
        lineItems: [
          {
            title: "Big Brown Bear Boots",
            priceSet: {
              shopMoney: {
                amount: 74.99,
                currencyCode: "EUR"
              }
            },
            quantity: 3,
            taxLines: [
              {
                priceSet: {
                  shopMoney: {
                    amount: 13.5,
                    currencyCode: "EUR"
                  }
                },
                rate: 0.06,
                title: "State tax"
              }
            ]
          }
        ],
        transactions: [
          {
            kind: "SALE",
            status: "SUCCESS",
            amountSet: {
              shopMoney: {
                amount: 238.47,
                currencyCode: "EUR"
              }
            }
          }
        ]
      }
    };
  
    const query = `mutation OrderCreate($order: OrderCreateOrderInput!, $options: OrderCreateOptionsInput) {
      orderCreate(order: $order, options: $options) {
        userErrors {
          field
          message
        }
        order {
          id
          totalTaxSet {
            shopMoney {
              amount
              currencyCode
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
    }`;
  
    try {
      const response = await this.shopifyService.executeGraphQL(query, variables);
      return response;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
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
