import { Controller, Get, Post,Req, Body, Patch, Param, Delete } from '@nestjs/common';
import { BuisnessService } from './buisness.service';
import { CreateBuisnessDto } from './dto/create-buisness.dto';
import { UpdateBuisnessDto } from './dto/update-buisness.dto';

@Controller('buisness')
export class BuisnessController {
  constructor(private readonly buisnessService: BuisnessService) {}

  @Post()
  create(@Body() createBuisnessDto: CreateBuisnessDto) {
    return this.buisnessService.create(createBuisnessDto);
  }

 

  @Get(':id')
  findOne(@Param('id') id: string,@Req() req: Request) {
    const user = req['user']; 
    return this.buisnessService.findOne(id,user);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBuisnessDto: UpdateBuisnessDto) {
    return this.buisnessService.update(+id, updateBuisnessDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.buisnessService.remove(+id);
  }
}
