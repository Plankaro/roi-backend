import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Res, Req, Put } from '@nestjs/common';
import { Response } from 'express';
import { ChatsService } from './chats.service';

import { Public } from 'src/auth/decorator/public.decorator';
import { MediaDto } from './dto/media-chat-dto';
import { Request } from 'express';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';
import { getWhatsappConfig } from 'utils/usefulfunction';
import { SendMessageDto, SendTemplateMessageDto } from './dto/sendchat-dto';


@Controller('chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService,private readonly whatsappService: WhatsappService) {}

  @Public()
  @Get('/webhook')
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ): void {
    const VERIFY_TOKEN = 'testwebhook';
    console.log(mode, token, challenge);

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      console.log('WEBHOOK_VERIFICATION_FAILED');
      res.sendStatus(403);
    }
  }
  @Post('/template')
  async create(@Body() sendTemplateMessageDto: SendTemplateMessageDto,@Req() req: any ) {


    return this.chatsService.sendTemplatemessage(sendTemplateMessageDto,req);
  }

  @Post('/text')
  SendText(@Body() sendChatDto:SendMessageDto,@Req() req: Request ){
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
    console.log(receievemessageDto);
   
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
  markMessageAsRead(@Query('prospect_id') prospectId: string,@Req() req: Request,) {
    return this.chatsService.markMessageAsRead(prospectId,req);
  }

  

 


}