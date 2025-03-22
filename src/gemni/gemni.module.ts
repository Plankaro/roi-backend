import { Module } from '@nestjs/common';
import { GemniService } from './gemni.service';

@Module({
  providers: [GemniService],
  exports: [GemniService],
})
export class GemniModule {}
