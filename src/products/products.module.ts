import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ShopifyModule } from 'src/shopify/shopify.module';

@Module({
  imports:[ShopifyModule],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
