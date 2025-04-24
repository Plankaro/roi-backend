import { Controller, Get, Post, Body, Patch, Param, Delete, Res, Req } from '@nestjs/common';
import { GoService } from './go.service';
import { CreateGoDto } from './dto/create-go.dto';
import { UpdateGoDto } from './dto/update-go.dto';
import { Response } from 'express';
import { Public } from 'src/auth/decorator/public.decorator';
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

@Public()
  @Get(':id')
   findOne(@Param('id') id: string, @Res() res: Response,@Req()req:Request) {
    
     return this.goService.findOne(id,res,req);
 
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
