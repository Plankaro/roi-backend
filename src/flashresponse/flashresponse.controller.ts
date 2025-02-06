import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FlashresponseService } from './flashresponse.service';
import { CreateFlashresponseDto } from './dto/create-flashresponse.dto';
import { UpdateFlashresponseDto } from './dto/update-flashresponse.dto';

@Controller('flashresponse')
export class FlashresponseController {
  constructor(private readonly flashresponseService: FlashresponseService) {}

  @Post()
  create(@Body() createFlashresponseDto: CreateFlashresponseDto) {
    return this.flashresponseService.create(createFlashresponseDto);
  }

  @Get()
  findAll() {
    return this.flashresponseService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.flashresponseService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFlashresponseDto: UpdateFlashresponseDto) {
    return this.flashresponseService.update(id, updateFlashresponseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.flashresponseService.remove(id);
  }
}
