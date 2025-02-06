import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateFlashresponseDto } from './create-flashresponse.dto';

export class UpdateFlashresponseDto extends PartialType(
  PickType(CreateFlashresponseDto, ['short', 'message', 'isPrivate'] as const)
) {}
