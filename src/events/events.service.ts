import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { sanitizePhoneNumber } from 'utils/usefulfunction';
import { DatabaseService } from 'src/database/database.service';
import { InjectQueue } from '@nestjs/bullmq';
import { delay, Queue, tryCatch } from 'bullmq';
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
    console.log(updateCheckout)
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

  async manipulatePayment(paymentData: any) {
    const payment = await this.databaseService.paymentLink.findUnique({
      where: {
        razorpay_link_id:paymentData.payload.payment_link.entity.id,
      }
    })
    if (payment) {
      const updatedPayment = await this.databaseService.paymentLink.update({
        where: {
          razorpay_link_id:paymentData.payload.payment_link.entity.id,
        },
        data: {
          status: paymentData.payload.payment_link.entity.status,
        },
      })
      console.log('Payment updated successfully:', updatedPayment)
    }
  }
}
