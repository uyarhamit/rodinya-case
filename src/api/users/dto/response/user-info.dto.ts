import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../schema/user.schema';

export class UserInfoDto {
  @ApiProperty({
    description: 'Email of the user',
  })
  email: string;

  @ApiProperty({
    description: 'Role of the user',
  })
  role: UserRole;

  constructor(partial: Partial<UserInfoDto>) {
    Object.assign(this, partial);
  }
}
