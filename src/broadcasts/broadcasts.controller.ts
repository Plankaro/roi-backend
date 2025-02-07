import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { BroadcastsService } from './broadcasts.service';
import { CreateBroadcastDto } from './dto/create-broadcast.dto';
import { UpdateBroadcastDto } from './dto/update-broadcast.dto';

@Controller()
export class BroadcastsController {
  constructor(private readonly broadcastsService: BroadcastsService) {}

  @MessagePattern('createBroadcast')
  create(@Payload() createBroadcastDto: CreateBroadcastDto) {
    return this.broadcastsService.create(createBroadcastDto);
  }

  @MessagePattern('findAllBroadcasts')
  findAll() {
    return this.broadcastsService.findAll();
  }

  @MessagePattern('findOneBroadcast')
  findOne(@Payload() id: number) {
    return this.broadcastsService.findOne(id);
  }

  @MessagePattern('updateBroadcast')
  update(@Payload() updateBroadcastDto: UpdateBroadcastDto) {
    return this.broadcastsService.update(updateBroadcastDto.id, updateBroadcastDto);
  }

  @MessagePattern('removeBroadcast')
  remove(@Payload() id: number) {
    return this.broadcastsService.remove(id);
  }
}
