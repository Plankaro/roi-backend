import { ConflictException, Injectable } from '@nestjs/common';
import { CreateBuisnessDto } from './dto/create-buisness.dto';
import { UpdateBuisnessDto } from './dto/update-buisness.dto';
import { DatabaseService } from 'src/database/database.service';

import { InternalServerErrorException,BadRequestException } from '@nestjs/common';
@Injectable()
export class BuisnessService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createBuisnessDto: CreateBuisnessDto) {
    try {
      const alredyExists = await this.databaseService.user.findUnique({
        where: {
          id: createBuisnessDto.createdBy,
          role: 'ADMIN',
        },
      });

      if (alredyExists) {
        throw new ConflictException(
          'a buisness is already created by this user',
        );
      }

      const buisness = await this.databaseService.business.create({
        data: {
          ...createBuisnessDto,
        },
      });

      return { message: 'success', buisness: buisness };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async findOne(businessId: string, userId: string) {
   try {
     const business = await this.databaseService.business.findFirst({
       where: {
         id: businessId, // The business ID
         employees: {
           some: {
             id:userId
           },
         },
       },
       include: {
         employees: true, // Include employee details if needed
       },
     });
 
     if(!business){
     
     throw new BadRequestException('buisness not found or you dont have acess to it');
   }
   
     return business;
   } catch (error) {
    throw new InternalServerErrorException(error);
   }
  }
  

  update(id: number, updateBuisnessDto: UpdateBuisnessDto) {
  /**
   * Update a buisness.
   * @param id The id of the buisness.
   * @param updateBuisnessDto The updated buisness data.
   * @returns The updated buisness.
   */
    return `This action updates a #${id} buisness`;
  }

  remove(id: number) {
    return `This action removes a #${id} buisness`;
  }
  async getNotifications(user_id: string) {
    try {
      const notifications = await this.databaseService.notification.findMany({
      where:{
        user_id: user_id
      }
      });
      return notifications;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

}
