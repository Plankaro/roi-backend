import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BroadcastService } from './broadcast.service';
import { CreateBroadcastDto } from './dto/create-broadcast.dto';
import { UpdateBroadcastDto } from './dto/update-broadcast.dto';

@Controller('broadcast')
export class BroadcastController {
  constructor(private readonly broadcastService: BroadcastService) {}

  @Post()
  create(@Body() createBroadcastDto: any) {
    return this.broadcastService.create(createBroadcastDto);
  }

  @Get()
  findAll() {
    return this.broadcastService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.broadcastService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBroadcastDto: UpdateBroadcastDto) {
    return this.broadcastService.update(+id, updateBroadcastDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.broadcastService.remove(+id);
  }
}
