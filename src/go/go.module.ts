import { Module } from '@nestjs/common';
import { GoService } from './go.service';
import { GoController } from './go.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
    imports:[DatabaseModule],
  controllers: [GoController],
  providers: [GoService],
})
export class GoModule {}
