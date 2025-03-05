import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateFlashresponseDto } from './create-flashresponse.dto';

export class UpdateFlashresponseDto extends PartialType(CreateFlashresponseDto) {}
