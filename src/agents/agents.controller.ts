import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { AgentsService } from './agents.service';
import { CreateAgentDto } from './dto/create-agent.dto';
import { UpdateAgentDto } from './dto/update-agent.dto';

@Controller('agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Post()
  create(@Body() createAgentDto: CreateAgentDto, @Req() req: Request ) {
    return this.agentsService.create(createAgentDto, req);
  }

  @Get()
  findAll(@Req() req: Request) {
    return this.agentsService.findAll(req);
  }

  @Get(':id')
  findOne(@Param('id') id: string,@Req() req: Request) {
    return this.agentsService.findOne(id, req);
  }

  @Patch(':id',)
  update(@Param('id') id: string, @Body() updateAgentDto: UpdateAgentDto,@Req() req: Request) {
    return this.agentsService.update(id, updateAgentDto,req);
  }

  @Delete(':id',)
  remove(@Param('id') id: string,@Req() req: Request) {
    return this.agentsService.remove(id,req);
  }
  @Post('assign-chat')
  assignChat( @Body() updateAgent: any, @Req() req: any) {
    return this.agentsService.assignChat(updateAgent, req);
  }
}
