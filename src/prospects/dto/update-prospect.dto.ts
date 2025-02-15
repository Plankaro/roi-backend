import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { PartialType, PickType } from '@nestjs/mapped-types';
import { CreateProspectDto } from './create-prospect.dto';
import { Lead } from '@prisma/client';

export class UpdateProspectDto extends PartialType(
  PickType(CreateProspectDto, ['name', 'email','image'] as const),
) {
  @IsOptional()
  @IsEnum(Lead)
  lead?: Lead;

 

}
