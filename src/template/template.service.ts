import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { DatabaseService } from 'src/database/database.service';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';
import { getWhatsappConfig } from 'utils/usefulfunction';
import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
} from '@nestjs/common';
import { Express } from 'express';
import * as fs from 'fs';
import * as FormData from 'form-data';
import axios from 'axios';
import * as mime from 'mime-types';
import * as path from 'path';

@Injectable()
export class TemplateService {
  constructor(
    private databaseService: DatabaseService,
    private whatsappService: WhatsappService,
  ) {}
  async create(CreateTemplateDto: any, req: any) {
    try {
      const user = req?.user;

      const components = [];
      if (CreateTemplateDto.header.type !== 'none') {
        if (CreateTemplateDto.header.type === 'text') {
          components.push({
            type: 'header',
            format: 'TEXT',
            text: CreateTemplateDto.header.value,
          });
        }
        if (
          CreateTemplateDto.header.type === 'image' ||
          CreateTemplateDto.header.type === 'video'
        ) {
          components.push({
            type: 'header',
            format:
              CreateTemplateDto.header.type === 'video' ? 'VIDEO' : 'IMAGE',
            example: {
              header_handle: [CreateTemplateDto.header.value],
            },
          });
        }
      }

      if (CreateTemplateDto.body.text.length > 0) {
        if (CreateTemplateDto.body.variables.length > 0) {
          components.push({
            type: 'body',
            text: CreateTemplateDto.body.text,
            example:{
              body_text: [CreateTemplateDto.body.variables.map((variable) => {
                return [variable.value].join(",");
              })]
            },
          });
        } else {
          components.push({
            type: 'body',
            text: CreateTemplateDto.body.text,
          });
        }
      }
      if(CreateTemplateDto.footer.length>0){
        components.push({
          type:"footer",
          text:CreateTemplateDto.footer
        })
      }
      if (CreateTemplateDto.buttons.length > 0) {
        const buttons = [];
        CreateTemplateDto.buttons.map((button) => {
          if (button.type === 'link') {
            buttons.push({
              type: 'URL',
              text: button.text,
              url: button.value.replace(/\/?$/, '/') + '{{1}}',
              example: [button.value.replace(/\/?$/, '/') + '767687686'],
            });
          } else if (button.type === 'call') {
            buttons.push({
              type: 'PHONE_NUMBER',
              text: button.text,
              phone_number: button.value,
            });
          } else if (button.type === 'copy') {
            buttons.push({
              type: 'COPY_CODE',
              example: button.value,
            });
          }
        });
        components.push({
          type: "BUTTONS",
          buttons:buttons

        })
      }
      const whatsappTemplatePayload = {
        name:CreateTemplateDto.name,
        language:CreateTemplateDto.language,
        category:CreateTemplateDto.category,
        components:components

      }

      const config = getWhatsappConfig(user?.business);
      console.log(config);

      const sendTemplateToMeta = await this.whatsappService.sendTemplateToMeta(
        whatsappTemplatePayload,
        config,
      );
      console.log(JSON.stringify(sendTemplateToMeta));
    } catch (error) {
      console.log(JSON.stringify(error,null,2))
      throw new InternalServerErrorException(error);
    }
  }

  //tested
  async remove(id: string, req: any) {
    try {
      const findTemplateById = await this.databaseService.template.findUnique({
        where: {
          id: id,
          createdForId: req.user.business.id,
        },
      });

      if (!findTemplateById) {
        throw new BadRequestException('Template not found');
      }
      const config = getWhatsappConfig(req.user.business);

      const deletetemplate = await this.whatsappService.deleteTemplate(
        findTemplateById.id,
        config,
      );
      console.log(deletetemplate);
      if (deletetemplate.success === true) {
        await this.databaseService.template.delete({
          where: {
            id: id,
            createdForId: req.user.business.id,
          },
        });
      }

      return {
        success: true,
      };
    } catch (error) {
      console.log(JSON.stringify(error.data));
      throw new InternalServerErrorException(error);
    }
  }

  async uploadMediaByPathResumable(
    filePath: string,
    caption?: string,
  ): Promise<any> {
    const config = getWhatsappConfig();

    // Ensure the file exists
    if (!fs.existsSync(filePath)) {
      throw new BadRequestException(`File does not exist at path: ${filePath}`);
    }

    // Determine MIME type based on file extension
    const mimeType = mime.lookup(filePath) || 'application/octet-stream';
    console.debug(`[DEBUG] MIME type for ${filePath}: ${mimeType}`);

    // Determine media type (not used directly here, but could help if caption logic is needed)
    let mediaType: 'image' | 'video' | 'document';
    if (mimeType.startsWith('image/')) {
      mediaType = 'image';
    } else if (mimeType.startsWith('video/')) {
      mediaType = 'video';
    } else {
      mediaType = 'document';
    }
    console.debug(`[DEBUG] Determined media type: ${mediaType}`);

    // Get file size and file name
    const fileSize = fs.statSync(filePath).size;
    const fileName = path.basename(filePath);
    console.debug(
      `[DEBUG] File size: ${fileSize} bytes, File name: ${fileName}`,
    );

    try {
      // === Step 1: Start the Upload Session ===
      console.debug('[DEBUG] Starting upload session...');
      const startSessionResponse = await axios.post(
        `https://graph.facebook.com/v21.0/612148088430798/uploads/`,
        null,
        {
          params: {
            file_length: fileSize,
            file_type: mimeType,
            file_name: fileName,
          },
          headers: {
            // For resumable uploads, use "OAuth" rather than "Bearer"
            Authorization: `OAuth ${config.whatsappApiToken}`,
          },
        },
      );
      console.debug(
        '[DEBUG] Start session response:',
        startSessionResponse.data,
      );

      const sessionIdWithPrefix: string = startSessionResponse.data.id; // e.g., "upload:ABC123..."
      const uploadSessionId = sessionIdWithPrefix.split(':')[1];
      console.debug(`[DEBUG] Upload session ID extracted: ${uploadSessionId}`);

      const initialOffset = 0;
      console.debug(
        `[DEBUG] Initiating file upload from offset ${initialOffset}...`,
      );
      const uploadResponse = await axios.post(
        `https://graph.facebook.com/v21.0/upload:${uploadSessionId}`,
        fs.createReadStream(filePath),
        {
          headers: {
            Authorization: `OAuth ${config.whatsappApiToken}`,
            file_offset: initialOffset.toString(),
            'Content-Type': mimeType,
            'Content-Length': fileSize.toString(),
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        },
      );
      console.debug('[DEBUG] Upload response:', uploadResponse.data);

      const fileHandle = uploadResponse.data.h;
      console.debug(`[DEBUG] Received file handle: ${fileHandle}`);

      console.debug(
        '[DEBUG] Media uploaded successfully with resumable API:',
        JSON.stringify(uploadResponse.data, null, 2),
      );
      return uploadResponse.data;
    } catch (error: any) {
      console.error(
        '[DEBUG] Error during resumable upload:',
        error.response?.data || error.message,
      );
      throw new InternalServerErrorException(
        error.response?.data?.error?.message ||
          'Failed to upload media via Meta Resumable Upload API.',
      );
    } finally {
      await fs.promises.unlink(filePath);
      console.debug(`[DEBUG] Deleted file ${filePath} after upload.`);
    }
  }

  async getFile(fileName: string) {
    const config = getWhatsappConfig();

    const response = await this.whatsappService.getMedia(fileName, config);
    return response;
  }
}
