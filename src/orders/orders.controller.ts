import { Controller,Req, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Request } from 'express';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() CreateOrderDto: any,@Req() req:Request) {
    console.log(CreateOrderDto)
    return this.ordersService.create(CreateOrderDto,req);
  }

  @Get()
  findAll(@Req() req: Request) {
    return this.ordersService.findAll(req);
  }

  @Get('/customer/:id')
  findOne(@Param('id') id: string,@Req() req: any) {
    console.log(req)
    return this.ordersService.findOrderforCustomer(id,req);
  }

 
}
