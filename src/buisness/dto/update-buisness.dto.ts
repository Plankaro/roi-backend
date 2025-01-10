import { PartialType } from '@nestjs/mapped-types';
import { CreateBuisnessDto } from './create-buisness.dto';

export class UpdateBuisnessDto extends PartialType(CreateBuisnessDto) {}
