import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { UserRole } from '../schema/user.schema';

export class CreateUserDto {
  @ApiProperty({
    description: 'Email of the new user',
    example: 'email@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description:
      'Password for the new member (min 8 characters, at least one uppercase letter, one lowercase letter, one number, one special character)',
    example: 'SecureP@ss1',
  })
  @IsNotEmpty()
  @IsString()
  @Length(8, 50)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&+.])[A-Za-z\d@$!%*?&+.]{8,50}$/,
    {
      message:
        'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special characters inside of the list ( @$!%*?&+. ).',
    },
  )
  password: string;

  passwordHash?: string;

  @ApiProperty({ enum: UserRole, example: UserRole.ADMIN })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;
}
