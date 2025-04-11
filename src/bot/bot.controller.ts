import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { BotService } from './bot.service';
import { CreateBotDto } from './dto/create-bot.dto';


@Controller('bot')
export class BotController {
  constructor(private readonly botService: BotService) {}

 

  @Get()
  findAll(@Req() req: Request) {

    return this.botService.findAll(req);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.botService.findOne(+id);
  }

  @Post('')
  update(@Body() updateBotDto: any, @Req() req: Request) {
    console.log("route hit")
    console.log(updateBotDto);
    return this.botService.update(updateBotDto,req);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.botService.remove(+id);
  }
}
