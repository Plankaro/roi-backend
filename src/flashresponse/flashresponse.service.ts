import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateFlashresponseDto } from './dto/create-flashresponse.dto';
import { UpdateFlashresponseDto } from './dto/update-flashresponse.dto';
import { DatabaseService } from 'src/database/database.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class FlashresponseService {
  constructor(private readonly databaseService: DatabaseService) {}
  async create(createFlashresponseDto: CreateFlashresponseDto,req:any) {
    try {
      const user = req?.user
      console.log(user)
      const createFlashresponse = await this.databaseService.flashResponse.create({
        data: {
          heading:createFlashresponseDto.heading,
          message: createFlashresponseDto.message,
          category: createFlashresponseDto.category,
          shareWithOthers: createFlashresponseDto.shareWithOthers,
          createdBy: user?.id,
          createdForId: user?.business?.id,

        },
      })
      return createFlashresponse;
    } catch (error) {
      console.log(error);
    throw new InternalServerErrorException(`Failed to create flashresponse: ${error.message}`);
    }
  }

  async findAll(req:any) {
    const user = req?.user

    try {
      const responses = await this.databaseService.flashResponse.findMany({
        where: {
       
          OR: [
            {

              createdBy:user?.id,
              shareWithOthers: true,
              createdForId: user.business.id,
            },
            {
              shareWithOthers: false,
              createdBy: user.id,
              createdForId: user.business.id,
            },
          ],
        },
        include: {
          creator: {
            select: {
              name: true,
            },
          },
          createdFor: {
            select: {
              businessName: true,
            },
          },
        },
      });
      
      return responses;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error);
    }
   
  }

 async findOne(id: string) {
    try {
      const response = await this.databaseService.flashResponse.findUnique({
        where: {
          id: id,
        },
      });
      return response;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error);
    }
  }

  async update(id: string, updateFlashresponseDto: UpdateFlashresponseDto,req) {
    console.log(updateFlashresponseDto)
    try {
    const updatedData = await this.databaseService.flashResponse.update({
      where: {
        id: id,
        createdBy: req.user.id,
        createdForId: req.user.business.id,
      },
      data: {
        heading:updateFlashresponseDto.heading,
        message: updateFlashresponseDto.message,
        category: updateFlashresponseDto.category,
        shareWithOthers: updateFlashresponseDto.shareWithOthers,
      },
    })
    return updatedData;
    } catch (error) {
      console.log(error);
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Flash response with id ${id} not found.`);
      }
      throw new InternalServerErrorException(error);
    }
  }

  async remove(id: string) {
    try {
      const deletdData = await this.databaseService.flashResponse.delete({
        where: {
          id: id,
        },
      })
      return deletdData;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Flash response with id ${id} not found.`);
      }
      throw new InternalServerErrorException(error);
    }
  }
}
