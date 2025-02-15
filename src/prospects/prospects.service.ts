import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProspectDto } from './dto/create-prospect.dto';
import { UpdateProspectDto } from './dto/update-prospect.dto';
import { DatabaseService } from 'src/database/database.service';
import { InternalServerErrorException } from '@nestjs/common';
import { WhatsappService } from 'src/whatsapp/whatsapp.service';
import { getWhatsappConfig } from 'utils/usefulfunction';

@Injectable()
export class ProspectsService {
  constructor(private readonly databaseService: DatabaseService,private readonly whatsappService: WhatsappService) {}
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

  async update(id: string, updateProspectDto: UpdateProspectDto,req:any) {
    const buisnessNo = req.user.business.whatsapp_mobile
    try {
      const updateProspect = await this.databaseService.prospect.update({
        where: {
          id,
          buisnessNo: buisnessNo,
        },
        data: {
         ...updateProspectDto,
        },
      })
      console.log(updateProspect)
      return updateProspect
    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }

  remove(id: number) {
    return `This action removes a #${id} prospect`;
  }

  async changeblockstatus(id: string,req:any) {
    const buisness = req.user.business
    console.log(id)
    console.log(buisness)
    try {
      const findPropspect = await this.databaseService.prospect.findUnique({
        where: {
          id,
          // buisnessNo: buisness.whatsapp_mobile,
        }
      })
    
      if (!findPropspect) {
        throw new BadRequestException('Prospect not found')
      }
      const config = getWhatsappConfig(buisness)
      if(!findPropspect.is_blocked){
        console.log("blocking")
        await this.whatsappService.blockNumber(findPropspect.phoneNo,config)
      }else{
        console.log("unblocking")
        await this.whatsappService.unblockNumber(findPropspect.phoneNo,config)
      }
      
      const updateProspect = await this.databaseService.prospect.update({
        where: {
          id,
          buisnessNo: buisness.whatsapp_mobile,
        },
        data: {
          is_blocked: !findPropspect.is_blocked,
        },
      })
      return updateProspect

    } catch (error) {
      console.error(error)
    }

  }



  
}
