import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { UserRole } from '../../schema/user.schema';

export class UserResponseDto {
  @ApiProperty({
    description: 'Id of the user',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Email of the user',
  })
  @Expose()
  email: string;

  @ApiProperty({
    description: 'Role of the user',
  })
  @Expose()
  role: UserRole;

  @ApiProperty({
    description: 'Created at date of the user',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Updated at date of the user',
  })
  @Expose()
  updatedAt: Date;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
