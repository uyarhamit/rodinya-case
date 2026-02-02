import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class CreateMediaDto {
  @ApiProperty({ description: 'Name of the media' })
  @IsString()
  fileName: string;

  @ApiProperty({ description: 'Path of the media' })
  @IsString()
  filePath: string;

  @ApiProperty({ description: 'Mime type of the media' })
  @IsString()
  mimeType: string;

  @ApiProperty({ description: 'Size of the media' })
  @IsNumber()
  size: number;
}
