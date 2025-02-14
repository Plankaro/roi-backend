import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';
import { DatabaseService } from 'src/database/database.service';
import { tryCatch } from 'bullmq';

@Injectable()
export class AgentsService {
  constructor(private readonly databaseService:DatabaseService) { }
  create(createAgentDto: CreateAgentDto,req:any) {
    try {
      const user = req.user

      if(!user.role){
        throw new UnauthorizedException("Admin can only create agents")
      }
      const agent = this.databaseService.user.create({
        data:{
          name: createAgentDto.name,
          email: createAgentDto.email,
          role: "AGENT",
          isEmailVerified: true,
          // Business: {
          //   connect: {
              
          //   }
          // }
        }

      })
      return agent
      
    } catch (error) {
      throw new InternalServerErrorException(error)
    }
  }

  findAll(req:any) {
   try {
    const user = req.user

    if(!user.role){
      throw new UnauthorizedException("Admin can only create agents")
    }
    const agents = this.databaseService.user.findMany({
      where: {
        role: "AGENT",
        business:{
         
            id: user.Business.id
         
        }
      }
    })
    return agents
    
   } catch (error) {
    throw new InternalServerErrorException(error)
   }
  }

  findOne(id: string) {
    return `This action returns a #${id} agent`;
  }

  update(id: string, updateAgentDto: UpdateAgentDto) {
    return `This action updates a #${id} agent`;
  }

  remove(id: string,req:any) {

   try {
    const user = req.user

    const agent = this.databaseService.user.delete({
      where: {
        id,
        role: "AGENT",
        business:{
         
            id: user.Business[0].id
        
        }
      }
    })
    return agent

    
   } catch (error) {
    
   }
  }
}
