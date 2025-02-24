import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { ShopifyModule } from 'src/shopify/shopify.module';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports:[ShopifyModule,DatabaseModule],
  controllers: [CustomersController],
  providers: [CustomersService],
  exports:[CustomersService]
})
export class CustomersModule {}
