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
import { CustomersModule } from './customers/customers.module';
import { AuthModule } from './auth/auth.module';
import { RedisModule } from '@nestjs-modules/ioredis';
import { BuisnessModule } from './buisness/buisness.module';
import { JwtModule } from '@nestjs/jwt';
import { ChatsModule } from './chats/chats.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { SendgridModule } from './sendgrid/sendgrid.module';
import { ProspectsModule } from './prospects/prospects.module';
import '@shopify/shopify-api/adapters/node';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ShopifyExpressModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        return {
          apiKey: configService.get('SHOPIFY_API_KEY'),
          apiSecretKey: configService.get('SHOPIFY_API_SECRET'),
          apiVersion: ApiVersion.October24,
          hostName: configService.get('SHOPIFY_STORE'),
          isEmbeddedApp: true,
          scopes: ['test_scope'],
          sessionStorage:{}
        };
      },
      inject: [ConfigService],
    }),
    RedisModule.forRoot({
      type: 'single',
      url: process.env.REDIS_URL,
      options:{
        password: process.env.REDIS_PASSWORD,
        username: process.env.REDIS_USER
      }
    }),
    DatabaseModule,
    ShopifyModule,
    ProductsModule,
    OrdersModule,
    CustomersModule,
    AuthModule,
    BuisnessModule,
    ChatsModule,
    WhatsappModule,
    SendgridModule,
    ProspectsModule,
   
  ],
    
  controllers: [AppController],
  providers: [AppService, OrdersService],
})
export class AppModule {}
