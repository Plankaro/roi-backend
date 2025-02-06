import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateFlashresponseDto } from './dto/create-flashresponse.dto';
import { UpdateFlashresponseDto } from './dto/update-flashresponse.dto';
import { DatabaseService } from 'src/database/database.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class FlashresponseService {
  constructor(private readonly databaseService: DatabaseService) {}
  async create(createFlashresponseDto: CreateFlashresponseDto) {
    try {
      const createFlashresponse = await this.databaseService.flashResponse.create({
        data: {
          short: createFlashresponseDto.short,
          message: createFlashresponseDto.message,
          createdBy: createFlashresponseDto.createdBy,
          createdForId: createFlashresponseDto.createdForId,
          isPrivate: createFlashresponseDto.isPrivate,
        },
      })
      return createFlashresponse;
    } catch (error) {
    throw new InternalServerErrorException(`Failed to create flashresponse: ${error.message}`);
    }
  }

  async findAll() {

    try {
      const response = await this.databaseService.flashResponse.findMany();
      return response;
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

  async update(id: string, updateFlashresponseDto: UpdateFlashresponseDto) {
    try {
    const updatedData = await this.databaseService.flashResponse.update({
      where: {
        id: id,
      },
      data: {
        short: updateFlashresponseDto.short,
        message: updateFlashresponseDto.message,
       
        isPrivate: updateFlashresponseDto.isPrivate,
      },
    })
    return updatedData;
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
