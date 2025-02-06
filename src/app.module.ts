import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ShopifyModule } from './shopify/shopify.module';
import { ProductsModule } from './products/products.module';
import { CacheModule } from '@nestjs/cache-manager';


import { OrdersModule } from './orders/orders.module';
import { CustomersModule } from './customers/customers.module';
import { AuthModule } from './auth/auth.module';
import { RedisModule } from '@nestjs-modules/ioredis';
import { BuisnessModule } from './buisness/buisness.module';

import { ChatsModule } from './chats/chats.module';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { SendgridModule } from './sendgrid/sendgrid.module';
import { ProspectsModule } from './prospects/prospects.module';

import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { FlashresponseModule } from './flashresponse/flashresponse.module';
import { BroadcastModule } from './broadcast/broadcast.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.register(),
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
    CloudinaryModule,
    FlashresponseModule,
    BroadcastModule,
   
  ],
    
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
