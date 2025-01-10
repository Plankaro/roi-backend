import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { ShopifyModule } from 'src/shopify/shopify.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports:[ShopifyModule],
  controllers: [CustomersController],
  providers: [CustomersService],
})
export class CustomersModule {}
