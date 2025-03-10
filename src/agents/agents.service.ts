import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { DatabaseService } from 'src/database/database.service';
import { hash, compare } from 'bcrypt';
@Injectable()
export class AgentsService {
  constructor(private readonly databaseService: DatabaseService) {}
  async create(createAgentDto: CreateAgentDto, req: any) {
    try {
      const user = req.user;

      if (user.role !== 'ADMIN' || user.manageTeam !== true) {
        throw new UnauthorizedException(
          'Admin or user with manage team permission can create agents',
        );
      }

      const alredyExists = await this.databaseService.user.findUnique({
        where: {
          email: createAgentDto.email,
        },
      });

      if (alredyExists) {
        throw new BadRequestException('Email already exists');
      }

      const hashedPassword = await hash(createAgentDto.password, 10);
      const agent = this.databaseService.user.create({
        data: {
          name: createAgentDto.name,
          email: createAgentDto.email,
          image: createAgentDto.image,
          role: 'AGENT',
          isEmailVerified: true,
          manageCampaign: createAgentDto.manageCampaign,
          manageTeam: createAgentDto.manageTeam,
          ManageBroadcast: createAgentDto.ManageBroadcast,
          assignChat: createAgentDto.assignChat,
          password: hashedPassword,
          business: { connect: { id: user.business.id } },
          emailVerified: new Date(),

          // Business: {
          //   connect: {

          //   }
          // }
        },
      });
      return agent;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async findAll(req: any) {
    try {
      const user = req.user;
      console.log(user);

      const teams =await this.databaseService.user.findMany({
        where: {
          business: {
            id: user.business.id,
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          manageCampaign: true,
          manageTeam: true,
          ManageBroadcast: true,
          assignChat: true,
        }
      });
      const groupedTeams = {
        admin: teams.find((member) => member.role === 'ADMIN'),
        agents: teams.filter((member) => member.role === 'AGENT'),
      };
      
      return groupedTeams;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error);
    }
  }

  async findOne(id: string,req:any) {
   try {
     const user = req.user;
     const agent = await this.databaseService.user.findUnique({
       where: {
         id,
         businessId:user.business.id,
       }
     })
     if (!agent) {
       throw new BadRequestException('Agent not found');
     }
     return agent;

   } catch (error) {
     throw new InternalServerErrorException(error);
   }
  }

  async update(id: string, updateAgentDto: UpdateAgentDto,req:any) {
    try {
      const user = req.user;
      if (user.role!== 'ADMIN' && user.id!== id) {
        throw new UnauthorizedException("You are not allowed to update agents");
      }
      console.log(id)
      const agent = await this.databaseService.user.findUnique({
        where:{
          id,
          businessId:user.business.id,
        }

      })

      if (!agent) {
        throw new BadRequestException('Agent not found');
      }
      if(agent.role!=='AGENT'){
        throw new BadRequestException('Only update agents is allowed');
      }
      if(updateAgentDto?.password){
        const hashedPassword = await hash(updateAgentDto.password, 10);
        updateAgentDto.password = hashedPassword;
      }
     console.log(updateAgentDto);
      const updateAgent = await this.databaseService.user.update({
        where: {
          id,
        },
        data:{
          ...updateAgentDto,
        },
      })

      return updateAgent;
    }catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error);
    }
  }

  remove(id: string, req: any) {
    try {
      const user = req.user;

      if (user.role !== 'ADMIN' || user.manageTeam !== true) {
        throw new UnauthorizedException("You are not allowed to delete agents");
      }

      const agent = this.databaseService.user.delete({
        where: {
          id,
          role: 'AGENT',
          business: {
            id: user.business.id,
          },
        },
      });
      return agent;
    } catch (error) {}
  }
}
