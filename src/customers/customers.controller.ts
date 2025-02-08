import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards,Headers } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { AuthGuard } from 'src/auth/guards/authguard';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }

  @Get('/segments')
  GetAllSegments() {
    return this.customersService.getAllSegments();
  }
  @Get('/segments/:id')
  getSegment(@Param('id') id: string) {
    return this.customersService.getAllContactsForSegment(id);
  }

  @Get()
  getAllCustomers() {
    return this.customersService. getAllCustomers();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customersService.getCustomerById(id);
  }


 
}
