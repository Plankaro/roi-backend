import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { SendTemplateMessageDto } from './dto/template-chat';

@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post('/template')
  create(@Body() sendTemplateMessageDto: any) {
    return this.chatsService.create(sendTemplateMessageDto);
  }

  @Get("/template")
  findAll() {
    return this.chatsService.findAllTemplate();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chatsService.findOne(+id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateChatDto: UpdateChatDto) {
  //   return this.chatsService.update(+id, updateChatDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chatsService.remove(+id);
  }
}
