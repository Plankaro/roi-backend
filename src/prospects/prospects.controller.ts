import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query } from '@nestjs/common';
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
  findAll(@Req() req: Request,@Query() query: Record<string, string | string[]>) {
    console.log(query);
    
    return this.prospectsService.findAll(req,query);
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

  @Patch('block/:id')
  changeblockstatus(@Param('id') id: string,@Req() req: Request) {
    return this.prospectsService.changeblockstatus(id,req);
  }

  @Get('/tags')
  getTags(@Req() req: Request) {
    return this.prospectsService.getTags(req);
  }

  @Post('/tags')
  createTags(@Body() createProspectDto: CreateProspectDto,@Req() req: Request) {
    return this.prospectsService.createTags(createProspectDto,req);
  }
  @Delete('/tags/:id')
  deleteTags(@Param('id') id: string,@Req() req: Request) {
    return this.prospectsService.deleteTags(id,req);
  }
}
