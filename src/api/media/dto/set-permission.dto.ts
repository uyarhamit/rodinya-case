import { ApiProperty } from '@nestjs/swagger';
import { IsArray } from 'class-validator';

export class SetPermissionDto {
  @ApiProperty({
    description: 'Allowed user ids of the media',
    type: [String],
    example: ['1232qwx'],
  })
  @IsArray()
  allowedUserIds: string[];
}
