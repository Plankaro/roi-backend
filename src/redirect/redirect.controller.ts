import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import { RedirectService } from './redirect.service';
import { CreateRedirectDto } from './dto/create-redirect.dto';
import { UpdateRedirectDto } from './dto/update-redirect.dto';
import { Response } from 'express';

@Controller('redirect')
export class RedirectController {
  constructor(private readonly redirectService: RedirectService) {}

  @Post()
  create(@Body() createRedirectDto: CreateRedirectDto) {
    return this.redirectService.create(createRedirectDto);
  }

  @Get()
  findAll() {
    return this.redirectService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string,@Res() res: Response) {
    //for test 
    const redirect={url:"google.com"}
    return res.redirect(redirect.url.startsWith('http') ? redirect.url : `https://${redirect.url}`);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRedirectDto: UpdateRedirectDto) {
    return this.redirectService.update(+id, updateRedirectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.redirectService.remove(+id);
  }
}
