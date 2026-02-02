import { ApiProperty } from '@nestjs/swagger';

export class FileResponseDto {
  @ApiProperty({ description: 'Id of the media' })
  id: string;

  @ApiProperty({ description: 'Owner id of the media' })
  ownerId: string;

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

  @ApiProperty({ description: 'Created at date of the media' })
  createdAt: Date;

  constructor(partial: Partial<FileResponseDto>) {
    Object.assign(this, partial);
  }
}
