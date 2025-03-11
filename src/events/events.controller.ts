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
  createCheckout(
    @Body() checkoutData: any,
    @Headers() headers: Record<string, string>,
  ) {
    console.log("Received Checkout Payload:", checkoutData);
    console.log("Checkout Headers:", headers);
    // You can access, for example, headers['x-shopify-shop-domain']
    return checkoutData;
  }

  @Public()
  @Post('/order')
  createOrder(
    @Body() orderData: any,
    @Headers() headers: Record<string, string>,
  ) {

    console.log("Order Headers:",);
    // Pass the order data to your service for further processing
    this.eventsService.manipulateOrder(orderData, headers["x-shopify-shop-domain"]);
    return { success: true };
  }

  
  @Public()
  @Post('/cart')
  Cart(
    @Body() orderData: any,
    @Headers() headers: Record<string, string>,
  ) {
console.log("cart",headers)
    console.log("cart",orderData);
    // Pass the order" data to your service for further processing

    return { success: true };
  }

  @Public()
  @Post('/updatefullfillment')
  updatefullfillment(
    @Body() orderData: any,
    @Headers() headers: Record<string, string>,
  ) {
    console.log("updatefullfillment",headers)
    console.log("updatefullfillment",orderData);
    // Pass the order data to your service for further processing

    return { success: true };
  }

  
  @Public()
  @Post('/createFullfillment')
fullfillment(
    @Body() orderData: any,
    @Headers() headers: Record<string, string>,
  ) {
    console.log("fullfillment",headers)
    console.log("fullfillment",orderData);
    // Pass the order data to your service for further processing

    return { success: true };
  }




}
