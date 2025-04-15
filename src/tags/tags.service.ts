import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class TagsService {
  constructor(private readonly databaseService: DatabaseService) {}
  async create(createTagDto: any, req: any) {
   try {
     const user = req.user;
     const createTags = await this.databaseService.tag.create({
       data: {
         tagName: createTagDto.tagName,
         businessId: user.business.id,
         userId: user.id,
       },
     });
     return  createTags
   } catch (error) {
     throw new InternalServerErrorException(error);
   }
  }

  async findAll(req:any) {
  try {
     const user = req.user;
      return await this.databaseService.tag.findMany({
        where: {
          businessId: user.business.id,
        },
      });
  } catch (error) {
    throw new InternalServerErrorException(error);
  }
  }
  async getTagsByProspectId(prospectId: string, req: any) {
    console.log(prospectId);
    try {
      const user = req.user;
    const tagsForProspect = await this.databaseService.tag.findMany({
      where: {
        ProspectTag:{
          some: {
            prospect:{
              id: prospectId,
              business: {
                id: user.business.id
              }
            }
          },
        }
      }
    })
    const tagsNotForProspect = await this.databaseService.tag.findMany({
      where: {
        business: {
          id: user.business.id,
        },
        NOT: {
          ProspectTag: {
            some: {
              prospect: {
                id: prospectId,
              },
            },
          },
        },
      },
    });

    return { tagsForProspect, tagsNotForProspect };    

    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async createTagForProspect(prospectId: string, tagId: string, req: any) {
    console.log(prospectId,tagId);
    try {
      const user = req.user;
      const tags = await this.databaseService.prospectTag.findMany({
        where: {
          prospectId,
        },
      })
     
      if(tags.length >= 3){
        throw new BadRequestException('You can add only 3 tags');
      }

      return await this.databaseService.prospectTag.create({
        data: {
          prospectId,
          tagId,
         
        },
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error);
    }
  }

  async deleteTagForProspect(prospectTagId: string,tagId: string,req:any){
    try {
      const user = req.user;
      return await this.databaseService.prospectTag.delete({
        where: {
        prospectId_tagId:{
          prospectId: prospectTagId,
          tagId
        },
          prospect: {
            business: {
              id: user.business.id
            }
          }
          
        },
      });
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error);
    }
  }


  
 

  remove(id: string, req: any) {
    try {
      const user = req.user;
      return this.databaseService.tag.delete({
        where: {
          id,
          businessId: user.business.id,
        },
      })
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
