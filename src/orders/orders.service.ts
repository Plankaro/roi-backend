import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ShopifyService } from 'src/shopify/shopify.service';
import { DatabaseService } from 'src/database/database.service';
import { getShopifyConfig } from 'utils/usefulfunction';
@Injectable()
export class OrdersService {
  constructor(
    private readonly shopifyService: ShopifyService,
    private readonly databaseService: DatabaseService,
  ) {}
//   async create(CreateOrderDto: any, req: any) {
//     const buisness = req.user.business;
//     const config = getShopifyConfig(buisness);
//     console.log(CreateOrderDto);
//     const { customerId, Items, shippingAddress, totalPrice } = CreateOrderDto;

//     console.log(customerId)
//     const variables = {
      
//       purchasingEntity: {
//         customerId:customerId
//       },
//       order: {
//         currency: 'INR', // Ensure this matches Shopify's supported currencies
//         lineItems: Items.map((item) => ({
//           variantId: item.variantId, // This must be a valid Shopify Product Variant global ID
//           quantity: item.quantity, // Must be a positive integer
//         })),
//         shippingAddress: {
//           address1: shippingAddress.address1,
//           address2: shippingAddress.address2,
//           city: shippingAddress.city,
//           company: shippingAddress.company,
//           country: shippingAddress.country,
//           countryName: shippingAddress.countryName,
//           firstName: shippingAddress.firstName,
//           lastName: shippingAddress.lastName,
//           phone: shippingAddress.phone,
//           // state: shippingAddress.state,
//           province: shippingAddress.state,
//           zip: shippingAddress.zip,
//         },
//         transactions: [
//           {
//             kind: 'CAPTURE', // or 'AUTHORIZE' depending on your payment flow
//             status: 'PENDING',
//             gateway: 'cash_on_delivery',
//             amountSet: {
//               shopMoney: {
//                 amount: totalPrice.toString(),
//                 currencyCode: 'INR',
//               },
//             },
//           },
//         ],
//       },
//     };
//     console.log(variables);
//     const query = `
// mutation OrderCreate($order: OrderCreateOrderInput!, $options: OrderCreateOptionsInput) {
//   orderCreate(order: $order, options: $options) {
//     userErrors {
//       field
//       message
//     }
//     order {
//       id
//       currentTotalPriceSet {
//         shopMoney {
//           amount
//           currencyCode
//         }
//       }
//       currentSubtotalPriceSet {
//         shopMoney {
//           amount
//           currencyCode
//         }
//       }
//       currentTotalTaxSet {
//         shopMoney {
//           amount
//           currencyCode
//         }
//       }
//       transactions {
//         kind
//         status
//         amountSet {
//           shopMoney {
//             amount
//             currencyCode
//           }
//         }
//       }
//       lineItems(first: 5) {
//         nodes {
//           variant {
//             id
//           }
//           id
//           title
//           quantity
//           taxLines {
//             title
//             rate
//             priceSet {
//               shopMoney {
//                 amount
//                 currencyCode
//               }
//             }
//           }
//         }
//       }
//       customer {
//         id
//         firstName
//         lastName
//         email
//         phone
//       }
//     }
//   }
// }
// `;

//     try {
//       const response = await this.shopifyService.executeGraphQL(
//         query,
//         variables,
//         config,
//       );
//       if (!response.data) {
//         throw new BadRequestException('Order creation failed');
//       }
//       const getId = (gid: string): string => {
//         return gid.split('/').pop() || '';
//       };
//       console.log(JSON.stringify(response, null, 2));
//       // const ordercreate = await this.databaseService.order.create({
//       //   data:{
//       //     shopify_id:getId(response?.data?.orderCreate?.order?.id??""),
//       //     amount:response?.data?.orderCreate?.order?.currentTotalPriceSet?.shopMoney?.amount??"",

//       //   }
//       // })
//       // console.log(ordercreate);

//       return { response, variables };
//     } catch (error) {
//       console.error('Error creating order:', error);
//       throw error;
//     }
//   }

async create(CreateOrderDto: any, req: any) {
  const business = req.user.business;
  const config = getShopifyConfig(business);
  console.log(CreateOrderDto);
  const { customerId, Items, shippingAddress, totalPrice, shippingFee, discount } = CreateOrderDto;

  console.log(customerId);

  // Build variables for the draft order mutation
  const variables = {
    input: {
      purchasingEntity: {
        customerId: customerId,
      },
      appliedDiscount: { value: discount, valueType: "PERCENTAGE", title: "" },
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
        province: shippingAddress.state,
        zip: shippingAddress.zip,
      },
      billingAddress: {
        address1: shippingAddress.address1,
        address2: shippingAddress.address2,
        city: shippingAddress.city,
        company: shippingAddress.company,
        country: shippingAddress.country,
        countryName: shippingAddress.countryName,
        firstName: shippingAddress.firstName,
        lastName: shippingAddress.lastName,
        phone: shippingAddress.phone,
        province: shippingAddress.state,
        zip: shippingAddress.zip,
      },
      shippingLine: {
        title: "Standard Shipping",
        priceWithCurrency: {
          amount: shippingFee,
          currencyCode: "INR",
        },
      },
      lineItems: Items.map((item: any) => ({
        variantId: item.variantId,
        quantity: item.quantity,
      })),
    },
  };

  console.log(variables);

  const createDraftOrderQuery = `
mutation DraftOrderCreate($input: DraftOrderInput!) {
  draftOrderCreate(input: $input) {
    draftOrder {
      id
      totalPrice
      invoiceUrl
      status
    }
    userErrors {
      field
      message
    }
  }
}
`;

  try {
    const response = await this.shopifyService.executeGraphQL(createDraftOrderQuery, variables, config);
    
    // Check if draft order creation was successful
    const draftOrderId = response?.data?.draftOrderCreate?.draftOrder?.id;
    if (!draftOrderId) {
      throw new BadRequestException("Draft order creation failed");
    }

    console.log("Draft Order Created:", draftOrderId);

    // Proceed to complete the draft order
    const completeDraftOrderQuery = `
    mutation DraftOrderComplete($id: ID!) {
      draftOrderComplete(id: $id) {
         draftOrder {
      id
    }
        userErrors {
          field
          message
        }
      }
    }`;

    const completeResponse = await this.shopifyService.executeGraphQL(
      completeDraftOrderQuery,
      { id: draftOrderId },
      config
    );

    console.log("Draft Order Completed:", JSON.stringify(completeResponse, null, 2));

    return { draftOrderId, completeResponse };
  } catch (error) {
    console.error("Error processing draft order:", error);
    throw error;
  }
}



  findAll(req: any) {
    return `This action returns all orders`;
  }

  async findOrderforCustomer(id: string, req: any) {
    try {
      const customerId = id;
      const business = req?.user?.business;
      const config = getShopifyConfig(business);

      const query = `
    query ordersByCustomer($customerId: ID!) {
      customer(id: $customerId) {
        numberOfOrders
        amountSpent {
        amount
        currencyCode
      }
        orders(first: 250) {
          edges {
            node {
              id
              name
              createdAt
              unpaid
              landingPageUrl
              fulfillments {
                deliveredAt
                displayStatus
                estimatedDeliveryAt
                createdAt
              }
              fullyPaid
              currentTotalPriceSet {    # Updated total price info
                shopMoney {
                  amount
                  currencyCode
                }
              }
              lineItems(first: 5) {
                edges {
                  node {
                    title
                    quantity
                    originalUnitPriceSet {   # Instead of priceSet
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
      }
    }
      `;

      const variables = {
        customerId: `gid://shopify/Customer/${id}`,
      };

      const response = await this.shopifyService.executeGraphQL(
        query,
        variables,
        config,
      );

      // Clean up the Shopify response by removing nested edges/node wrappers
      const rawCustomer = response.data.customer;
      const cleanedResponse = {
        numberOfOrders: rawCustomer.numberOfOrders,
        amountSpent: rawCustomer.amountSpent,
        orders: rawCustomer.orders.edges.map((edge: any) => {
          const order = edge.node;
          return {
            // Optionally simplify the order id by removing the Shopify prefix
            id: order.id.replace('gid://shopify/Order/', ''),
            name: order.name,
            createdAt: order.createdAt,
            unpaid: order.unpaid,
            landingPageUrl: order.landingPageUrl,
            fulfillments: order.fulfillments,
            fullyPaid: order.fullyPaid,
            totalPrice: order.currentTotalPriceSet.shopMoney.amount,
            currency: order.currentTotalPriceSet.shopMoney.currencyCode,
            lineItems: order.lineItems.edges.map((itemEdge: any) => {
              const item = itemEdge.node;
              return {
                title: item.title,
                quantity: item.quantity,
                originalUnitPrice: item.originalUnitPriceSet.shopMoney.amount,
                currency: item.originalUnitPriceSet.shopMoney.currencyCode,
              };
            }),
          };
        }),
      };

      return cleanedResponse;
    } catch (error) {
      console.error('Error fetching orders for customer:', error);
      throw error;
    }
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
