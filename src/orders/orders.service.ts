import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { ShopifyService } from 'src/shopify/shopify.service';
import { DatabaseService } from 'src/database/database.service';
import { getShopifyConfig, sanitizePhoneNumber } from 'utils/usefulfunction';
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
    const {
      customerId,
      Items,
      shippingAddress,
      totalPrice,
      shippingFee,
      discount,
    } = CreateOrderDto;
    const findPropspect = await this.databaseService.prospect.findUnique({
      where: {
        id: customerId,
      },
    });
    if (!findPropspect) {
      throw new NotFoundException('prospect not found');
    }

    const findCustomerfromCustomer =
      await this.findOrCreateCustomerByProspectGraphQL(customerId, config);
    console.log(findCustomerfromCustomer);



    // Build variables for the draft order mutation
    const variables = {
      input: {
        purchasingEntity: {
          customerId: findCustomerfromCustomer?.id,
        },
        appliedDiscount: {
          value: discount,
          valueType: 'PERCENTAGE',
          title: '',
        },
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
          title: 'Standard Shipping',
          priceWithCurrency: {
            amount: shippingFee,
            currencyCode: 'INR',
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
      const response = await this.shopifyService.executeGraphQL(
        createDraftOrderQuery,
        variables,
        config,
      );

      // Check if draft order creation was successful
      const draftOrderId = response?.data?.draftOrderCreate?.draftOrder?.id;
      if (!draftOrderId) {
        throw new BadRequestException('Draft order creation failed');
      }

      console.log('Draft Order Created:', draftOrderId);

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
        config,
      );

      console.log(
        'Draft Order Completed:',
        JSON.stringify(completeResponse, null, 2),
      );

      return { draftOrderId, completeResponse };
    } catch (error) {
      console.error('Error processing draft order:', error);
      throw error;
    }
  }

  findAll(req: any) {
    return `This action returns all orders`;
  }

  async findOrderforCustomer(
    id: string,
    req: any,
    opts: {
      first?: number;
      after?: string;
      last?: number;
      before?: string;
    } = {},
  ) {
    try {
      // 1. Normalize the raw phone
      const propsect = await this.databaseService.prospect.findUnique({
        where: {
          id: id,
        },
      });
      const rawPhone = propsect.phoneNo;
      if (!rawPhone) {
        throw new Error('No phone number provided');
      }
      const normalizedPhone = `+${sanitizePhoneNumber(rawPhone)}`

      // 2. GraphQL with pagination args (default first=250)
      const QUERY = `
        query customerByIdentifierWithOrders(
          $identifier: CustomerIdentifierInput!
          $first: Int
          $after: String
          $last: Int
          $before: String
        ) {
          customer: customerByIdentifier(identifier: $identifier) {
            id
            numberOfOrders
            amountSpent {
              amount
              currencyCode
            }
            orders(
              first: $first
              after: $after
              last: $last
              before: $before
            ) {
              pageInfo {
                hasNextPage
                hasPreviousPage
                startCursor
                endCursor
              }
              edges {
                cursor
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
                  currentTotalPriceSet {
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
                        originalUnitPriceSet {
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

      // 3. Execute GraphQL
    
      const config = getShopifyConfig(req.user.business);
      const variables = {
        identifier: { phoneNumber: normalizedPhone },
        first: opts.first ?? 250,
        after: opts.after ?? null,
        last: opts.last ?? null,
        before: opts.before ?? null,
      };
      const resp = await this.shopifyService.executeGraphQL(
        QUERY,
        variables,
        config,
      );

      // 4. Clean up response
      const cust = resp.data.customer;
      if (!cust) {
        return {
          numberOfOrders: 0,
          amountSpent: { amount: 0, currencyCode: '' },
          orders: [],
          pageInfo: null,
        };
      }

      const pageInfo = cust.orders.pageInfo;
      const orders = cust.orders.edges.map((e: any) => {
        const o = e.node;
        return {
          cursor: e.cursor,
          id: o.id.replace('gid://shopify/Order/', ''),
          name: o.name,
          createdAt: o.createdAt,
          unpaid: o.unpaid,
          landingPageUrl: o.landingPageUrl,
          fulfillments: o.fulfillments,
          fullyPaid: o.fullyPaid,
          totalPrice: o.currentTotalPriceSet.shopMoney.amount,
          currency: o.currentTotalPriceSet.shopMoney.currencyCode,
          lineItems: o.lineItems.edges.map((ie: any) => ({
            title: ie.node.title,
            quantity: ie.node.quantity,
            originalUnitPrice: ie.node.originalUnitPriceSet.shopMoney.amount,
            currency: ie.node.originalUnitPriceSet.shopMoney.currencyCode,
          })),
        };
      });

      console.log(pageInfo)
      return {
        numberOfOrders: cust.numberOfOrders,
        amountSpent: cust.amountSpent,
        orders,
        pageInfo,
      };
    } catch (error) {
      console.error('Error fetching orders for customer:', error);
      throw error;
    }
  }

  async findOrCreateCustomerByProspectGraphQL(
    prospectId: string,
    config: { store: string; accessToken: string },
  ): Promise<any> {
    // 1) Fetch prospect from your DB
    const prospect = await this.databaseService.prospect.findUnique({
      where: { id: prospectId },
    });
    if (!prospect) {
      throw new NotFoundException(`Prospect ${prospectId} not found`);
    }
    const rawPhone = prospect.phoneNo;
    if (!rawPhone) {
      throw new InternalServerErrorException(
        `Prospect ${prospectId} has no phone number`
      );
    }

    // 2) Normalize phone to E.164
    const phoneE164 = `+${sanitizePhoneNumber(rawPhone)}`;

    // 3) GraphQL query: customerByIdentifier
    const FIND_BY_IDENTIFIER = `
      query findCustomerByIdentifier($identifier: CustomerIdentifierInput!) {
        customer: customerByIdentifier(identifier: $identifier) {
          id
          email
          phone
          firstName
          lastName
        }
      }
    `;

    const identifier = { phoneNumber: phoneE164 };

    try {
      const lookup = await this.shopifyService.executeGraphQL(
        FIND_BY_IDENTIFIER,
        { identifier },
        config
      );

      const existing = lookup.data?.customer;
      if (existing) {
        // Found existing customer
        return existing;
      }
    } catch (err: any) {
      console.error('GraphQL lookup failed:', err);
      throw new InternalServerErrorException(
        `Failed to lookup customer: ${err.message}`
      );
    }

    // 4) If not found, create new customer
    const CREATE_CUSTOMER = `
      mutation createCustomer($input: CustomerInput!) {
        customerCreate(input: $input) {
          customer {
            id
            email
            phone
            firstName
            lastName
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const nameParts = (prospect.name || '').trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1
      ? nameParts.slice(1).join(' ')
      : '';

    const createInput = {
      phone: phoneE164,
      email: prospect.email,
      firstName,
      lastName,
    };

    try {
      const created = await this.shopifyService.executeGraphQL(
        CREATE_CUSTOMER,
        { input: createInput },
        config
      );

      const payload = created.data?.customerCreate;
      if (payload.userErrors?.length) {
        const msg = payload.userErrors.map((e: any) => e.message).join('; ');
        throw new Error(msg);
      }
      return payload.customer;
    } catch (err: any) {
      console.error('GraphQL create failed:', err);
      throw new InternalServerErrorException(
        `Failed to create customer: ${err.message}`
      );
    }
  }

  /**
   * Example of how to call executeGraphQL yourself:
   */
}
