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

@Injectable()
export class TemplateService {
  constructor(
    private databaseService: DatabaseService,
    private whatsappService: WhatsappService,
  ) {}
  async create(CreateTemplateDto: CreateTemplateDto, req: any) {
    try {
      const user = req.user;
      const iftemplatenameexist = await this.databaseService.template.findFirst(
        {
          where: {
            name: CreateTemplateDto.name,
            createdForId: user.business.id,
            createdBy: user.id,
          },
        },
      );
      if (iftemplatenameexist) {
        throw new BadRequestException('Template name already exist');
      }
      const config = getWhatsappConfig(user.business);
      const sendTemplateToMeta = await this.whatsappService.sendTemplateToMeta(
        CreateTemplateDto,
        config,
      );

      const createTemplate = await this.databaseService.template.create({
        data: {
          whatsapp_id: sendTemplateToMeta.id,
          name: CreateTemplateDto.name,
          languageCode: CreateTemplateDto.languageCode,
          category: CreateTemplateDto.category,
          status: sendTemplateToMeta.status,
          createdAt: new Date(),
          createdBy: user.id,
          createdForId: user.business.id,
        },
      });
      return createTemplate;
    } catch (error) {
      console.log(error);
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
      console.log(error);
      throw new InternalServerErrorException(error);
    }
  }
}
