import { Injectable } from '@nestjs/common';
import { CreateRedirectDto } from './dto/create-redirect.dto';
import { UpdateRedirectDto } from './dto/update-redirect.dto';

@Injectable()
export class RedirectService {
  create(createRedirectDto: CreateRedirectDto) {
    return 'This action adds a new redirect';
  }

  findAll() {
    return `This action returns all redirect`;
  }

  findOne(id: number) {
    return `This action returns a #${id} redirect`;
  }

  update(id: number, updateRedirectDto: UpdateRedirectDto) {
    return `This action updates a #${id} redirect`;
  }

  remove(id: number) {
    return `This action removes a #${id} redirect`;
  }
}
