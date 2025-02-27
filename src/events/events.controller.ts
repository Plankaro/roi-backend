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
    console.log("Received Order Payload:", orderData);
    console.log("Order Headers:", headers);
    // Pass the order data to your service for further processing
    // this.eventsService.manipulateOrder(orderData);
    return { success: true };
  }


  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(+id, updateEventDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.eventsService.remove(+id);
  }
}
