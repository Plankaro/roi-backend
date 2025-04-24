import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { DatabaseModule } from 'src/database/database.module';
import { JwtModule } from '@nestjs/jwt';
import { SendgridModule } from 'src/sendgrid/sendgrid.module';
import { BullModule } from '@nestjs/bullmq';
import { ShopifyModule } from 'src/shopify/shopify.module';
import { WebhookSubscribe } from './processor/webhooksubscribe';
import { WebhookUnsubscribe } from './processor/webhookunsubscribe';
@Module({
  imports: [
    DatabaseModule,
    ShopifyModule,
    JwtModule.register({}),
    SendgridModule,
    BullModule.registerQueue(
      {
        name: 'webhookSubscribe',
      },
      {
        name: 'webhookUnsubscribe',
      },
    ),
  ],
  controllers: [AuthController],
  providers: [AuthService,WebhookSubscribe,WebhookUnsubscribe],
  exports: [AuthService],
})
export class AuthModule {}
