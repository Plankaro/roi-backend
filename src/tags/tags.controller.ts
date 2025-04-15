import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query } from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  create(@Body() createTagDto: any, @Req() req: any) {
    return this.tagsService.create(createTagDto,req);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.tagsService.findAll(req);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.tagsService.getTagsByProspectId(id,req);
  }
 


  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.tagsService.remove(id,req);
  }

  @Post("/prospect")
  createTagForProspect(@Body() createTagDto: any, @Req() req: any) {
    
    return this.tagsService.createTagForProspect(createTagDto.ProspectId,createTagDto.tagId,req);
  }

  @Get("/prospect/:id")
  getTagsByProspectId(@Param('id') prospectId: string, @Req() req: any) {
    return this.tagsService.getTagsByProspectId(prospectId,req);
  }

  @Delete("/prospect/:id")
  deleteTagForProspect(@Param('id') prospectTagId: string, @Query('tag_id') tagId: string,  @Req() req: any) {
    return this.tagsService.deleteTagForProspect(prospectTagId,tagId,req);
  }
}
