import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import * as path from 'path';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const extension = path.extname(file.originalname).slice(1).toLowerCase();
    return {
      folder: 'uploads',
      // Use 'raw' for PDF files to ensure proper handling, otherwise let Cloudinary determine the type.
      resource_type: extension === 'pdf' ? 'raw' : 'auto',
      format: extension,
      public_id: `${file.originalname.split('.')[0]}-${Date.now()}`,
    };
  },
});
