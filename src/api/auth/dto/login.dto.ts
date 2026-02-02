import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Email of the user',
    example: 'example@email.com',
  })
  @IsEmail()
  email: string;
  @ApiProperty({
    description: 'Password of the user',
    example: 'P@ssw0rd1',
  })
  password: string;
}
