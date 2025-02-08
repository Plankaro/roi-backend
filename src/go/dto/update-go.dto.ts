import { PartialType } from '@nestjs/mapped-types';
import { CreateGoDto } from './create-go.dto';

export class UpdateGoDto extends PartialType(CreateGoDto) {}
