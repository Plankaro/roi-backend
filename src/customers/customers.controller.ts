import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards,Headers,Req } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { AuthGuard } from 'src/auth/guards/authguard';
import { Request } from 'express';
import { Public } from 'src/auth/decorator/public.decorator';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  create(@Body() createCustomerDto: CreateCustomerDto ,@Req() req:Request) {
    return this.customersService.create(createCustomerDto, req);
  }

  
  @Get('/starred')
  getStarCustomers(@Req() req: any) {
    console.log("this route is hit EREEE")
    return this.customersService.getStarCustomers(req);
  }

  @Get('/segments')
  GetAllSegments(@Req() req:any) {
    console.log(req.user)
    return this.customersService.getSegmentsWithCustomerCounts(req);
  }

  @Get('/segments/:id')
  getSegment(@Param('id') id: string,@Req() req:Request) {

    return this.customersService.getAllContactsForSegment(id,req);
  }

 
  @Get()
  getAllCustomers(@Req() req:Request) {
  
    return this.customersService.getAllCustomers(req);
    
  }

  @Get(':id')
  findOne(@Param('id') id: string,@Req() req:Request) {
    return this.customersService.getCustomerById(id,req);
  }

  @Post('/starred')
  createStarCustomer(@Body() body: any,@Req() req: any) {
    return this.customersService.createStarCustomer(body,req);
  }


 
}
