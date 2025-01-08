import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { ShopifyModule } from 'src/shopify/shopify.module';

@Module({
  imports:[ShopifyModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
