import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { TemplateService } from './template.service';
import {  CreateTemplateDto  } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { Public } from 'src/auth/decorator/public.decorator';

@Controller('template')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

 
  @Post()
  create(@Body() CreateTemplateDto:  CreateTemplateDto,@Req() req:any ) {
    
    return this.templateService.create(CreateTemplateDto,req);
  }

@Public()
  @Delete(':id')
  remove(@Param('id') id: string,@Req() req:any) {
    return this.templateService.remove(id,req);
  }
}
