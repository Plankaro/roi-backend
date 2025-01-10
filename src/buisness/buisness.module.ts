import { Module } from '@nestjs/common';
import { BuisnessService } from './buisness.service';
import { BuisnessController } from './buisness.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports:[DatabaseModule],
  controllers: [BuisnessController],
  providers: [BuisnessService],
})
export class BuisnessModule {}
