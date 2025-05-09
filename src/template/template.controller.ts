import { Controller, Get, Post, Body, Patch, Param, Delete, Req,UseInterceptors,UploadedFile,BadRequestException, Query } from '@nestjs/common';
import { TemplateService } from './template.service';
import {  CreateTemplateDto  } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { Public } from 'src/auth/decorator/public.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('template')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Get()
  findAll(@Req() req: Request) {
    return this.templateService.findAllTemplate(req);
  }

  
 
  @Post()
  create(@Body() CreateTemplateDto: any,@Req() req:any ) {
    
    return this.templateService.create(CreateTemplateDto,req);
  }

 
  @Delete('')
  remove(@Query('name') name: string, @Req() req: any) {
    return this.templateService.remove(name, req);
  }
  


  @Post('upload-media')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads', // Temporary storage directory
        filename: (req, file, cb) => {
          // Generate a unique filename
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    if (!file || !file.path) {
      throw new BadRequestException('File is not provided or file path is missing');
    }
    // Pass the file path to the service function
    return await this.templateService.uploadMediaByPathResumable(file.path,req);
  }

  @Public()
  @Get('upload-media/:id')
  async getFile(@Param('id') id: string){
    return this.templateService.getFile(id);
  }
}
