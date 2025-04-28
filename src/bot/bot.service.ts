import { Injectable, InternalServerErrorException, Req } from '@nestjs/common';
import { CreateBotDto } from './dto/create-bot.dto';
import { UpdateBotDto } from './dto/update-bot.dto';
import { DatabaseService } from 'src/database/database.service';
import { Bots, BotType } from '@prisma/client';
@Injectable()
export class BotService {
  constructor(private readonly databaseService: DatabaseService) {}
  create(createBotDto: CreateBotDto) {
    return 'This action adds a new bot';
  }

  async findAll(req: any) {
    const user = req?.user || req;

    // Fetch all bots for this business
    const bots = await this.databaseService.bots.findMany({
      where: {
        buisness_id: user.business.id,
      },
    });

    // Create a map for quick lookup
    const botMap = bots.reduce(
      (acc, bot) => {
        acc[bot.type] = bot;
        return acc;
      },
      {} as Record<BotType, Bots>,
    );

    // Ensure all BotTypes are present, missing ones will be undefined
    const groupedByType = Object.values(BotType).reduce(
      (acc, type) => {
        acc[type] = botMap[type] ?? null; // ✅ returns undefined if not present
        return acc;
      },
      {} as Record<BotType, Bots | null>,
    );

   
    return groupedByType;
  }

  findOne(id: number) {
    return `This action returns a #${id} bot`;
  }

  async update(updateBotDto: any, req: any) {
    try {
      const user = req.user;
 

      const bot = await this.databaseService.bots.upsert({
        where: {
          buisness_id_type: {
            buisness_id: user.business.id,
            type: updateBotDto.type,
          },
        },
        update: {
          ...updateBotDto,
        },
        create: {
          Buisness: {
            connect: { id: user.business.id },
          },
          type: updateBotDto.type,
        },
      });

      return bot;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error); 
    }
  }

  remove(id: number) {
    return `This action removes a #${id} bot`;
  }
}
