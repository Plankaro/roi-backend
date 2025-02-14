import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Request } from 'express';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}


  @Get()
  findAll(@Req() req:Request) {
    return this.productsService.findAll(req);
  }

  
  @Get(':id')
  findOne(@Param('id') id: string,@Req() req:Request) {
    return this.productsService.findOne(id,req);
  }

  
}
