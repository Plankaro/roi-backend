import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import { GoService } from './go.service';
import { CreateGoDto } from './dto/create-go.dto';
import { UpdateGoDto } from './dto/update-go.dto';
import { Response } from 'express';
@Controller('go')
export class GoController {
  constructor(private readonly goService: GoService) {}

  @Post()
  create(@Body() createGoDto: CreateGoDto) {
    return this.goService.create(createGoDto);
  }

  @Get()
  findAll() {
    return this.goService.findAll();
  }

  @Get(':url')
   findOne(@Param('url') url: string,@Res() res: Response) {
     console.log(url)
     this.goService.findOne(url);
     return res.redirect(url.startsWith('http') ? url : `https://${url}`);
 
   }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGoDto: UpdateGoDto) {
    return this.goService.update(+id, updateGoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.goService.remove(+id);
  }
}
