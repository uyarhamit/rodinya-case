import { ApiProperty } from '@nestjs/swagger';
import { UserInfoDto } from '../../../users/dto/response/user-info.dto';

export class FilePermissionDto {
  @ApiProperty({ description: 'Id of the media' })
  id: string;

  @ApiProperty({ description: 'Owner id of the media' })
  ownerId: string;

  @ApiProperty({ description: 'Owner of the media' })
  owner: UserInfoDto;

  @ApiProperty({ description: 'Name of the media' })
  fileName: string;

  @ApiProperty({ description: 'Path of the media' })
  filePath: string;

  @ApiProperty({ description: 'Mime type of the media' })
  mimeType: string;

  @ApiProperty({ description: 'Size of the media' })
  size: number;

  @ApiProperty({ description: 'Allowed user ids of the media' })
  allowedUserIds: string[];

  @ApiProperty({ description: 'Allowed users of the media' })
  allowedUsers: UserInfoDto[];

  @ApiProperty({ description: 'Created at date of the media' })
  createdAt: Date;

  constructor(partial: Partial<FilePermissionDto>) {
    Object.assign(this, partial);
  }
}
