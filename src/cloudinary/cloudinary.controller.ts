import { Controller, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { storage } from './cloudinary.config';

@Controller('cloudinary')
export class CloudinaryController {

  @Post('/upload-multiple')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'files', maxCount: 10 },
    { name: 'file', maxCount: 1 },
  ], { storage }))
  async uploadMultipleFiles(@UploadedFiles() files: { files?: Express.Multer.File[], file?: Express.Multer.File[] }) {
    const uploadedFiles = (files.files || []).concat(files.file || []);
    if (uploadedFiles.length === 0) {
      throw new Error('No files uploaded');
    }

    return uploadedFiles.map(file => ({
      name: file.originalname,
      link: file.path,
    }));
  }
}

