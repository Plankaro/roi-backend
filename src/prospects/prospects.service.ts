import { Injectable } from '@nestjs/common';
import { CreateProspectDto } from './dto/create-prospect.dto';
import { UpdateProspectDto } from './dto/update-prospect.dto';
import { DatabaseService } from 'src/database/database.service';
import { InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class ProspectsService {
  constructor(private readonly databaseService: DatabaseService) {}
  create(createProspectDto: CreateProspectDto) {
    try {
      const { shopify_id, name, email, phone, image } = createProspectDto;
      return this.databaseService.prospect.create({
        data: {
          shopify_id,
          name,
          email,
          image,
          phoneNo: phone,
          lead: 'LEAD',
          buisnessNo: '15551365364',
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  async findAll() {
    try {
      const response = await this.databaseService.prospect.findMany({
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

  update(id: number, updateProspectDto: UpdateProspectDto) {
    return `This action updates a #${id} prospect`;
  }

  remove(id: number) {
    return `This action removes a #${id} prospect`;
  }
}
