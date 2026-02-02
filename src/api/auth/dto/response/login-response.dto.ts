import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT Access Token',
    example: 'eyJhbGciOiJIUzI1Ni...',
  })
  @Expose()
  accessToken: string;

  @ApiProperty({
    description: 'JWT Refresh Token',
    example: 'eyJhbGciOiJIUzI1Ni...',
  })
  @Expose()
  refreshToken: string;

  @ApiProperty({
    description: 'Expiration date of the refresh token',
    example: '2025-06-12T10:00:00.000Z',
  })
  @Expose()
  refreshTokenExpiresAt: Date;

  constructor(partial: Partial<LoginResponseDto>) {
    Object.assign(this, partial);
  }
}
