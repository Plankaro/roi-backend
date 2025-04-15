import { IsString, IsNotEmpty } from 'class-validator';

// DTO for creating a tag with only the tag name
export class CreateTagDto {
  @IsString()
  @IsNotEmpty({ message: 'Tag name is required' })
  tagName: string;
}

// DTO for associating a tag to a prospect (using two identifiers)
export class TagAssociationDto {
  @IsString()
  @IsNotEmpty({ message: 'ProspectId is required' })
  ProspectId: string; // corresponds to createTagDto.ProspectId

  @IsString()
  @IsNotEmpty({ message: 'TagId is required' })
  tagId: string; // corresponds to createTagDto.tagId
}
