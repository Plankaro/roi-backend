import { Module } from '@nestjs/common';
import { FlashresponseService } from './flashresponse.service';
import { FlashresponseController } from './flashresponse.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [FlashresponseController],
  providers: [FlashresponseService],
})
export class FlashresponseModule {}
