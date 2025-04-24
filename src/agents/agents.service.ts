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
import { AuthService } from 'src/auth/auth.service';
@Injectable()
export class AgentsService {
  constructor(private readonly databaseService: DatabaseService, private readonly authService: AuthService) {}
  async create(createAgentDto: CreateAgentDto, req: any) {
    try {
      const user = req.user;

      if (user.role !== 'ADMIN') {
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

    
      const agent = await this.databaseService.user.create({
        data: {
          name: createAgentDto.name,
          email: createAgentDto.email,
          image: createAgentDto.image,
          role: 'AGENT',
          isEmailVerified: true,
          manageCampaign: createAgentDto.manageCampaign,
          manageBots: createAgentDto.manageBots,
          ManageBroadcast: createAgentDto.ManageBroadcast,
          assignChat: createAgentDto.assignChat,
          phone: createAgentDto.phone,
          business: { connect: { id: user.business.id } },
          emailVerified: new Date(),

          // Business: {
          //   connect: {

          //   }
          // }
        },
      });
      await this.authService.getTokenLink(agent.email);
      return {
        message: 'Agent created successfully and verification link sent',}
     
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async findAll(req: any) {
    try {
      const user = req.user;
      console.log(user);

      const teams = await this.databaseService.user.findMany({
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
          manageBots: true,
          ManageBroadcast: true,
          assignChat: true,
        },
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

  async findOne(id: string, req: any) {
    try {
      const user = req.user;
      const agent = await this.databaseService.user.findUnique({
        where: {
          id,
          businessId: user.business.id,
        },
      });
      if (!agent) {
        throw new BadRequestException('Agent not found');
      }
      return agent;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async update(id: string, updateAgentDto: UpdateAgentDto, req: any) {
    try {
      const user = req.user;
      if (user.role !== 'ADMIN') {
        throw new UnauthorizedException('You are not allowed to update agents');
      }
      console.log(id);
      const agent = await this.databaseService.user.findUnique({
        where: {
          id,
          businessId: user.business.id,
        },
      });

      if (!agent) {
        throw new BadRequestException('Agent not found');
      }
      if (agent.role !== 'AGENT') {
        throw new BadRequestException('Only update agents is allowed');
      }
    
      console.log(updateAgentDto);
      const updateAgent = await this.databaseService.user.update({
        where: {
          id,
        },
        data: {
          ...updateAgentDto,
        },
      });

      return updateAgent;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error);
    }
  }

  async remove(id: string, req: any) {
    try {
      const user = req.user;

      if (user.role !== 'ADMIN' ) {
        throw new UnauthorizedException('You are not allowed to delete agents');
      }

      const agent = await this.databaseService.user.delete({
        where: {
          id,
          role: 'AGENT',
          business: {
            id: user.business.id,
          },
        },
      });
      return agent;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async assignChat(updateAgent: any, req: any) {
    try {
      const user = req.user;
      const { agentId, prospectId } = updateAgent;

      console.log(agentId, prospectId);
      if (user.role !== 'ADMIN') {
        throw new UnauthorizedException(
          'Admin or user with manage team permission can assign chat to agents',
        );
      }
      const findifAgentExists = await this.databaseService.user.findUnique({
        where: {
          id: agentId,
          // role: 'AGENT',
          business: {
            id: user.business.id,
          },
        },
      })
      if (!findifAgentExists) {
        throw new BadRequestException('Agent does not exist');
      }
      const findifProspectExists = await this.databaseService.prospect.findUnique({
        where: {
          id: prospectId,
        },
      });
      if (!findifProspectExists) {
        throw new BadRequestException('Prospect does not exist');
      }
      const update = await this.databaseService.prospect.update({
        where: {
          id: prospectId,
        },
        data: {
          assignedToId: findifAgentExists.id,
        },
        include: {
          chats: {
            take: 1,

            orderBy: {
              createdAt: 'desc', // Adjust this field based on your schema
            },
            where: {
              deleted: false,
            },
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      });
      console.log(update);

      return update;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error);
    }
  }
}
