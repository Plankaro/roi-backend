import { Injectable } from '@nestjs/common';
import { CreateBroadcastDto } from './dto/create-broadcast.dto';
import { UpdateBroadcastDto } from './dto/update-broadcast.dto';

@Injectable()
export class BroadcastsService {
  create(createBroadcastDto: CreateBroadcastDto) {
    return 'This action adds a new broadcast';
  }

  findAll() {
    return `This action returns all broadcasts`;
  }

  findOne(id: number) {
    return `This action returns a #${id} broadcast`;
  }

  update(id: number, updateBroadcastDto: UpdateBroadcastDto) {
    return `This action updates a #${id} broadcast`;
  }

  remove(id: number) {
    return `This action removes a #${id} broadcast`;
  }
}
