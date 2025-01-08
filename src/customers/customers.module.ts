import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { ShopifyModule } from 'src/shopify/shopify.module';

@Module({
  imports:[ShopifyModule],
  controllers: [CustomersController],
  providers: [CustomersService],
})
export class CustomersModule {}
