import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ChatsService } from './chats.service';
import { SendTemplateMessageDto } from './dto/template-chat';
import { Public } from 'src/auth/decorator/public.decorator';
import { MediaDto } from './dto/media-chat-dto';


@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService, ) {}

  @Get('/webhook')
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ): void {
    const VERIFY_TOKEN = 'testwebhook';

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
  @Post('/template')
  create(@Body() sendTemplateMessageDto: any) {
    return this.chatsService.create(sendTemplateMessageDto);
  }

  @Post('/text')
  SendText(@Body() sendChatDto:any){
    return this.chatsService.sendMessage(sendChatDto)
  }

  @Get('/')

  findAllChats(
   
    @Query('prospect_id') prospect: string,
  ) {
    return this.chatsService.findAllChats(prospect);

  }


  @Post('/webhook')
  receiveMessage(@Body() receievemessageDto: any) {
   
 return this.chatsService.receiveMessage(receievemessageDto)
   
    // // Process the incoming message
   
  }

  @Get("/template")
  findAll() {
    return this.chatsService.findAllTemplate();
  }

 
  @Post('/media')
  sendMedia(@Body() mediaDto: MediaDto){
    return this.chatsService.sendMedia(mediaDto)
  }




}