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
import { BullModule } from '@nestjs/bullmq';

import { TemplateModule } from './template/template.module';

import { EventsModule } from './events/events.module';
import { GoModule } from './go/go.module';
import { AgentsModule } from './agents/agents.module';
import { CampaignModule } from './campaign/campaign.module';
import { GemniModule } from './gemni/gemni.module';




@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.register(),
    BullModule.forRoot({
      connection: {
        url: process.env.REDIS_URL,
        // Depending on your Aiven configuration, you may or may not need to specify these.
        // username: process.env.REDIS_USER,
        // password: process.env.REDIS_PASSWORD,
        // // If your connection uses TLS (rediss://) you can also add TLS options:
        // tls: { rejectUnauthorized: false },
      },
    }),
    RedisModule.forRoot({
      type: 'single',
      url: process.env.REDIS_URL,
      // options:{
      //   password: process.env.REDIS_PASSWORD,
      //   username: process.env.REDIS_USER
      // }
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
    TemplateModule,
  
    EventsModule,
    GoModule,
    AgentsModule,
    CampaignModule,
    GemniModule,
  
   
  ],
    
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
