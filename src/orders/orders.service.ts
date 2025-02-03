import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ShopifyService } from 'src/shopify/shopify.service';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class OrdersService {
  constructor(private readonly shopifyService: ShopifyService,private readonly databaseService: DatabaseService) {}
  async create(CreateOrderDto: any) {
    console.log(CreateOrderDto);
    const { customerId, Items, shippingAddress, totalPrice } = CreateOrderDto;
    console.log(customerId);
    const variables = {
      customer: {
        id: customerId,
      },
      order: {
        currency: 'INR', // Ensure this matches Shopify's supported currencies
        lineItems: Items.map((item) => ({
          variantId: item.variantId, // This must be a valid Shopify Product Variant global ID
          quantity: item.quantity, // Must be a positive integer
        })),
        shippingAddress: {
          address1: shippingAddress.address1,
          address2: shippingAddress.address2,
          city: shippingAddress.city,
          company: shippingAddress.company,
          country: shippingAddress.country,
          countryName: shippingAddress.countryName,
          firstName: shippingAddress.firstName,
          lastName: shippingAddress.lastName,
          phone: shippingAddress.phone,
          // state: shippingAddress.state,
          province: shippingAddress.state,
          zip: shippingAddress.zip,
        },
        transactions: [
          {
            kind: 'CAPTURE', // or 'AUTHORIZE' depending on your payment flow
            status: 'PENDING',
            gateway: 'cash_on_delivery',
            amountSet: {
              shopMoney: {
                amount: totalPrice.toString(),
                currencyCode: 'INR',
              },
            },
          },
        ],
      },
    };
    console.log(variables);
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
      customer {
        id
        firstName
        lastName
        email
        phone
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
      if(!response.data){
        throw new BadRequestException('Order creation failed')
      }
      const getId = (gid: string): string => {
        return gid.split('/').pop() || '';
      }
      console.log(JSON.stringify(response))
      const ordercreate = await this.databaseService.order.create({
        data:{
          shopify_id:getId(response?.data?.orderCreate?.order?.id??""),
          amount:response?.data?.orderCreate?.order?.currentTotalPriceSet?.shopMoney?.amount??"",
          
          prospect_shopify_id:getId(customerId)


        }
      })
      console.log(ordercreate); 

      return { response, variables };
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
