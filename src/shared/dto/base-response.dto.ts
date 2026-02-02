import { ApiProperty } from '@nestjs/swagger';
import { HttpStatus } from '@nestjs/common';
import { Expose } from 'class-transformer';

export class BaseResponseDto<T> {
  @ApiProperty({
    description: 'Returned Status Code',
    example: HttpStatus.OK,
    enum: HttpStatus,
  })
  @Expose()
  statusCode: number;
  @ApiProperty({
    description: 'Return Message',
    example: '[Model] retrieved successfully',
    type: String,
  })
  @Expose()
  message: string;
  data: T;
  @ApiProperty({
    description: 'Timestamp of the returned response',
    type: Date,
  })
  @Expose()
  timestamp: Date;

  constructor(statusCode: number, message: string, data: T) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.timestamp = new Date();
  }
}
