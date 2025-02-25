import { Controller, Get, Post, Body, Patch, Param, Delete,Req } from '@nestjs/common';
import { BroadcastService } from './broadcast.service';
import { CreateBroadcastDto } from './dto/create-broadcast.dto';
import { UpdateBroadcastDto } from './dto/update-broadcast.dto';
import { Request } from 'express';

@Controller('broadcast')
export class BroadcastController {
  constructor(private readonly broadcastService: BroadcastService) {}

  @Post()
  create(@Body() createBroadcastDto: any,@Req() req:Request) {
    return this.broadcastService.create(createBroadcastDto,req);
  }

  @Get()
  findAll(@Req() req:Request) {
    return this.broadcastService.getAllBroadcasts(req);
  }

  @Get(':id')
  findOne(@Param('id') id: string,@Req() req:Request) {
    return this.broadcastService.getBroadcastById(id,req);
  }

  @Post('/test')

  test(@Body() sendChatDto:any,@Req() req: Request ){
    return this.broadcastService.sendTestMessage(sendChatDto,req)
  }


// }
}