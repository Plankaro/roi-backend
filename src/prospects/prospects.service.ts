import { Injectable } from '@nestjs/common';
import { CreateProspectDto } from './dto/create-prospect.dto';
import { UpdateProspectDto } from './dto/update-prospect.dto';
import { DatabaseService } from 'src/database/database.service';
import { InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class ProspectsService {
   constructor(
      private readonly databaseService: DatabaseService,
   ){}
  create(createProspectDto: CreateProspectDto) {
    try {
      const {shopify_id, name, email, phone,} = createProspectDto
      return this.databaseService.prospect.create({
        data: {
          shopify_id,
          name,
          email,
          image,
          phoneNo:phone,
          lead:"LEAD"
        }
      })

      
    } catch (error) {
      throw new InternalServerErrorException(error.message)
    }
  }

  async findAll() {
   try {
     const response =await this.databaseService.prospect.findMany(
       {
        include:{
           chats: {
             take: 1, // Get only the last message
             orderBy: {
               sendDate: 'desc', // Sort by sendDate in descending order
             },
            
           },
           
 
         }
       }
     );
     console.log(response)
     return response
   } catch (error) {
    throw new InternalServerErrorException(error);
   }
  }

  findOne(id: number) {
    return `This action returns a #${id} prospect`;
  }

  update(id: number, updateProspectDto: UpdateProspectDto) {
    return `This action updates a #${id} prospect`;
  }

  remove(id: number) {
    return `This action removes a #${id} prospect`;
  }
}
