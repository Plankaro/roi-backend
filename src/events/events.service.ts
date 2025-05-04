import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { sanitizePhoneNumber } from 'utils/usefulfunction';
import { DatabaseService } from 'src/database/database.service';
import { InjectQueue } from '@nestjs/bullmq';
import { delay, Queue, tryCatch } from 'bullmq';
import { getShopifyConfig } from 'utils/usefulfunction';
import { ShopifyService } from 'src/shopify/shopify.service';
@Injectable()
export class EventsService {
  constructor(
    @InjectQueue('createOrderQueue') private readonly createOrderQueue: Queue,
    @InjectQueue('createCheckoutQueue')
    private readonly createCheckoutQueue: Queue,
    @InjectQueue('updatedCheckoutQueue')
    private readonly updatedCheckoutQueue: Queue,
    @InjectQueue('updateOrderQueue') private readonly updateOrderQueue:Queue,
    @InjectQueue('cancelOrderQueue') private readonly cancelOrderQueue:Queue,
    @InjectQueue('createFullfillmentQueue') private readonly createFullFillmentQueue:Queue,
    @InjectQueue('createFullfillmentEventQueue') private readonly createFullfillmentEventQueue:Queue,
    private readonly shopifyService: ShopifyService,

    private readonly databaseService: DatabaseService

    
  ) {}
  async manipulateOrder(orderData: any, domain: string) {
   

  
    await this.createOrderQueue.add(
      'createOrder',
      { orderData, domain },
      {
        delay: 0,
        removeOnComplete: true,
      },
    );
    return { success: true };

    
  }

  async manipulateUpdateOrder(updateOrder: any,domain: string){
    console.log("updated order triggered")

    await this.updateOrderQueue.add(
      'updateOrder',
      { orderData: updateOrder, domain },
      {
        delay: 0,
        removeOnComplete: true,
      },
    );
    return { success: true };
    
  }

  async manipulateCancelOrder(cancelOrder: any, domain: string) {

  
    await this.cancelOrderQueue.add(
      'cancelOrderQueue',
      { cancelOrderData: cancelOrder, domain },
      {
        delay: 0,
        removeOnComplete: true,
      },
    );
    return { success: true };
  }

  async manipulateCreateFullFillment(createFullFillment: any, domain: string) {
    await this.createFullFillmentQueue.add(
      'createFullFillmentQueue',
      { fullFillmentData: createFullFillment, domain },
      {
        delay: 0,
        removeOnComplete: true,
      },
    )
    return { success: true };
    
  }
  async manipulateUpdatedFulfillment(updatedFulfillment: any, domain: string) {
    await this.createFullfillmentEventQueue.add(
      'createFullfillmentEventQueue',
      { fullFillmentData: updatedFulfillment, domain },
      {
        delay: 0,
        removeOnComplete: true,
      },
    )
    return { success: true };
  }

  async manipulateUpdatedCheckout(updateCheckout: any, domain: string) {
  
    await this.updatedCheckoutQueue.add(
      'updatedCheckoutQueue',
      { checkOutData: updateCheckout, domain },
      {
        delay: 0,
        removeOnComplete: true,
      },
    );
    return { success: true };

    // try {
    //   console.log('Received updated checkout data:', updatedCheckOutData);
  }

  async manipulateCheckout(checkOutData: any, domain: string) {
    console.log("checkoutontriggered",JSON.stringify(checkOutData,null,2))
 
    await this.createCheckoutQueue.add(
      'createCheckoutQueue',
      { checkOutData, domain },
      {
        delay: 0,
        removeOnComplete: true,
      },
    );
    return { success: true };

    // try {
    //   console.log('Received checkout data:', checkOutData);
  }

  async   manipulatePayment(paymentData: any) {
    try {
      console.log('Received payment data:', JSON.stringify(paymentData, null, 2));
  
      const razorpayLinkId = paymentData?.payload?.payment_link?.entity?.id;
      if (!razorpayLinkId) {
        console.error('Razorpay link ID not found in payload');
        return;
      }
  
      const payment = await this.databaseService.paymentLink.findUnique({
        where: {
          razorpay_link_id: razorpayLinkId,
        },
      });
  
      if (!payment) {
        console.log('No payment record found for Razorpay link ID:', razorpayLinkId);
        return;
      }
  
      console.log('Payment record found, updating status...');
  
      const updatedPayment = await this.databaseService.paymentLink.update({
        where: {
          razorpay_link_id: razorpayLinkId,
        },
        data: {
          status: paymentData.payload.payment_link.entity.status,
        },
        include: {
          order: true,
          business: true,
        },
      });
  
      console.log('Payment updated successfully. Shopify Order ID:', updatedPayment.order?.shopify_id);
  
      const order_id = updatedPayment.order?.shopify_id;
  
      if (!order_id) {
        console.error('Order ID missing in updated payment.');
        return;
      }
  
      const query = `
        mutation MyMutation($id: ID!) {
          orderMarkAsPaid(input: { id: $id }) {
            userErrors {
              field
              message
            }
            order {
              canMarkAsPaid
              displayFinancialStatus
              displayFulfillmentStatus
            }
          }
        }
      `;
  
      const variables = {
        id: `gid://shopify/Order/${order_id}`,
      };
  
      const shopifyConfig = getShopifyConfig(updatedPayment.business);
  
      console.log('Calling Shopify GraphQL API with variables:', variables);
  
      const response = await this.shopifyService.executeGraphQL(query, variables, shopifyConfig);
  
      console.log('Shopify API Response:', JSON.stringify(response, null, 2));
      const updateOrder = await this.databaseService.order.update({
        where: {
          id: updatedPayment.order?.id,
        },
        data: {
          status: response.data.orderMarkAsPaid.order.displayFinancialStatus,
      }})
      console.log('Order updated successfully. Shopify Order ID:', updateOrder.shopify_id);
    } catch (error) {
      console.error('Error in manipulatePayment:', error);
    }
  }
  
}
