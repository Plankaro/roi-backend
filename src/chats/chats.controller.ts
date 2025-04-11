import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Res, Req, Put } from '@nestjs/common';
import { Response } from 'express';
import { ChatsService } from './chats.service';
import { SendTemplateMessageDto } from './dto/template-chat';
import { Public } from 'src/auth/decorator/public.decorator';
import { MediaDto } from './dto/media-chat-dto';
import { Request } from 'express';


@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService, ) {}

  @Public()
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
  create(@Body() sendTemplateMessageDto: any,@Req() req: Request ) {
    return this.chatsService.sendTemplatemessage(sendTemplateMessageDto,req);
  }

  @Post('/text')
  SendText(@Body() sendChatDto:any,@Req() req: Request ){
    return this.chatsService.sendMessage(sendChatDto,req)
  }

  @Get('/')

  findAllChats(
   
    @Query('prospect_id') prospect: string,
    @Req() req: Request 
  ) {
    return this.chatsService.findAllChats(prospect,req);

  }

  @Delete('/')
  removeAll(@Query('prospect_id') prospect: string,) {
   return this.chatsService.deleteMessage(prospect);
  }

  @Public()
  @Post('/webhook')
  receiveMessage(@Body() receievemessageDto: any) {
   
 return this.chatsService.receiveMessage(receievemessageDto)
   
    // // Process the incoming message
   
  }

  @Get("/template",)
  findAll(@Req() req: Request) {
    return this.chatsService.findAllTemplate(req);
  }

  @Get('/specific-template')
  getSpecificTemplates(@Query('name') name: string, @Req() req: any) {
    console.log('Template name:', name);
    return this.chatsService.getSpecificTemplates(name, req);
  }
 
  @Post('/media')
  sendMedia(@Body() mediaDto: MediaDto,@Req() req: Request ){
    return this.chatsService.sendMedia(mediaDto,req)
  }

  @Patch('/')
  markMessageAsRead(@Query('prospect_id') prospectId: string,@Req() req: Request,@Body() ids: string[]) {
    return this.chatsService.markMessageAsRead(prospectId,req);
  }

  

 


}