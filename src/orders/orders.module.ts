import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { ShopifyModule } from 'src/shopify/shopify.module';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports:[ShopifyModule,DatabaseModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
