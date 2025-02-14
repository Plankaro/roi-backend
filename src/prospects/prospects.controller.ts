import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { ProspectsService } from './prospects.service';
import { CreateProspectDto } from './dto/create-prospect.dto';
import { UpdateProspectDto } from './dto/update-prospect.dto';

import Request from 'express';
@Controller('prospects')
export class ProspectsController {
  constructor(private readonly prospectsService: ProspectsService) {}

  @Post()
  create(@Body() createProspectDto: CreateProspectDto,@Req() req: Request) {
  
    return this.prospectsService.create(createProspectDto,req);
  }

  @Get()
  findAll(@Req() req: Request) {
    
    return this.prospectsService.findAll(req);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.prospectsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProspectDto: UpdateProspectDto,@Req() req: Request) {
    return this.prospectsService.update(id, updateProspectDto,req);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prospectsService.remove(+id);
  }
}
