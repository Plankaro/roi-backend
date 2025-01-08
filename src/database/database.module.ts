import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { APP_FILTER } from '@nestjs/core';
import { PrismaClientExceptionFilter } from './database.filter';
@Module({
  providers: [DatabaseService, {
    provide: APP_FILTER,
    useClass: PrismaClientExceptionFilter,
  },],
  exports: [DatabaseService],
})
export class DatabaseModule {}
