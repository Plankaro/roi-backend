import { Controller, Get, Post, Body, Patch, Param, Delete,Headers } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Public } from 'src/auth/decorator/public.decorator';


@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Public()
  @Post('/checkout')
  async createCheckout(
    @Body() checkoutData: any,
    @Headers() headers: Record<string, string>,
  ) {
    console.log("checkoutData",JSON.stringify(checkoutData,null,2))
   
    await this.eventsService.manipulateCheckout(checkoutData, headers["x-shopify-shop-domain"]);

    return { success: true };
  }

  @Public()
  @Post('/updateCheckout')
  async updateCheckout(
    @Body() updateCheckout: any,
    @Headers() headers: Record<string, string>,
  ) {
    
   
    await this.eventsService.manipulateUpdatedCheckout(updateCheckout, headers["x-shopify-shop-domain"]);
    return { success: true };
  }


  @Public()
  @Post('/createorder')
async createOrder(
    @Body() orderData: any,
    @Headers() headers: Record<string, string>,
  ) {



    // Pass the order data to your service for further processing
    await this.eventsService.manipulateOrder(orderData, headers["x-shopify-shop-domain"]);
    return { success: true };
  }

  
  @Public()
  @Post('/updateOrder')
  async updateOrder(
    @Body() orderData: any,
    @Headers() headers: Record<string, string>,
  ) {

    await this.eventsService.manipulateUpdateOrder(orderData, headers["x-shopify-shop-domain"]);

    return { success: true };
  }

  @Public()
  @Post('/cancelOrder')
  async CancelOrder(
    @Body() orderData: any,
    @Headers() headers: Record<string, string>,
  ) {
    console.log("orderData",JSON.stringify(orderData,null,2))
    await this.eventsService.manipulateCancelOrder(orderData, headers["x-shopify-shop-domain"]);

    // return { success: true };
  }
  @Public()
  @Post('/updatefullfillment')
 async  updatefullfillment(
    @Body() orderData: any,
    @Headers() headers: Record<string, string>,
  
  ) {

   await this.eventsService.manipulateUpdatedFulfillment(orderData, headers["x-shopify-shop-domain"]);
    // Pass the order data to your service for further processing

    return { success: true };
  }



  
  @Public()
  @Post('/createFullfillment')
async fullfillment(
    @Body() orderData: any,
    @Headers() headers: Record<string, string>,
  ) {
    console.log("createfullfillment",JSON.stringify(orderData,null,2))
    await this.eventsService.manipulateCreateFullFillment(orderData, headers["x-shopify-shop-domain"]);
    // Pass the order data to your service for further processing

    return { success: true };
  }


  @Public()
  @Post('/payment')
async Payment(
    @Body() orderData: any,
    @Headers() headers: Record<string, string>,
  ) {
   console.log("payment",JSON.stringify(orderData,null,2))
   await this.eventsService.manipulatePayment(orderData);

    return { success: true };
  }

}

