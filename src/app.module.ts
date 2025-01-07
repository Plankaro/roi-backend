import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ShopifyModule } from './shopify/shopify.module';
import { ProductsModule } from './products/products.module';
import { ShopifyExpressModule, } from '@nestjs-shopify/express';
import { ApiVersion } from '@shopify/shopify-api';
import { OrdersService } from './orders/orders.service';
import { OrdersModule } from './orders/orders.module';
import '@shopify/shopify-api/adapters/node';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ShopifyExpressModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        return {
          apiKey: configService.get('SHOPIFY_API_KEY'),
          apiSecretKey: configService.get('SHOPIFY_API_SECRET'),
          apiVersion: ApiVersion.Unstable,
          hostName: configService.get('SHOPIFY_STORE'),
          isEmbeddedApp: true,
          scopes: ['test_scope'],
          sessionStorage:{}
        };
      },
      inject: [ConfigService],
    }),
    DatabaseModule,
    ShopifyModule,
    ProductsModule,
    OrdersModule],
    
  controllers: [AppController],
  providers: [AppService, OrdersService],
})
export class AppModule {}
