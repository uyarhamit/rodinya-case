import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Matches } from 'class-validator';
import { UserRole } from '../schema/user.schema';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'New password for the account',
    example: 'newSecurePassword123',
  })
  @IsOptional()
  @IsString()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&+.])[A-Za-z\d@$!%*?&+.]{8,50}$/,
    {
      message:
        'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special characters inside of the list ( @$!%*?&+. ).',
    },
  )
  newPassword?: string;

  @ApiPropertyOptional({ enum: UserRole, example: UserRole.ADMIN })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
