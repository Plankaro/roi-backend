import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProspectDto } from './dto/create-prospect.dto';
import { UpdateProspectDto } from './dto/update-prospect.dto';
import { DatabaseService } from 'src/database/database.service';
import { InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class ProspectsService {
  constructor(private readonly databaseService: DatabaseService) {}
  create(createProspectDto: CreateProspectDto,req:any) {
    try {
      const { shopify_id, name, email, phone, image } = createProspectDto;
      const buisnessNo = req.user.business.whatsapp_mobile
      if(!buisnessNo){
        throw new BadRequestException("Please complete whatsapp onboarding to acess this feature")
      }
console.log(buisnessNo)
      const prospect =  this.databaseService.prospect.create({
        data: {
          shopify_id,
          name,
          email,
          image,
          phoneNo: phone,
          lead: 'LEAD',
          buisnessNo: buisnessNo,
        },
      });
      return prospect
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException(error.message);
    }
  }

  async findAll(req:any) {
    console.log(req.user)
    
    try {
      const buisnessNo = req.user.business.whatsapp_mobile
      if(!buisnessNo){
        throw new BadRequestException("Please complete whatsapp onboarding to acess this feature")
      }
      const response = await this.databaseService.prospect.findMany({
        where: {
          buisnessNo:buisnessNo,
        },
        include: {
          chats: {
            take: 1,
            orderBy: {
              createdAt: 'desc', // Adjust this field based on your schema
            },
          },
        },
      });
      return response;

  
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error);
    }
  }

  async findOne(id: string) {
    try {
      const response = await this.databaseService.prospect.findUnique({
        where: {
          id,
        },
        include: {
          order: true,
         
        },
      });
      console.log
      return response;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  update(id: string, updateProspectDto: UpdateProspectDto,req:any) {

    
  }

  remove(id: number) {
    return `This action removes a #${id} prospect`;
  }
}
