import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { BaseResponseDto } from '../../shared/dto/base-response.dto';
import { UserResponseDto } from './dto/response/user-response.dto';
import { UserRole } from './schema/user.schema';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
@ApiTags('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get me info',
  })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'user fetched successfully',
    type: BaseResponseDto<UserResponseDto>,
    example: {
      statusCode: HttpStatus.OK,
      message: 'user fetched successfully',
      data: {
        id: '123qwe',
        email: 'example@email.com',
        role: UserRole.ADMIN,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    },
  })
  async me(@Request() req): Promise<BaseResponseDto<UserResponseDto>> {
    if (!req.user) {
      throw new UnauthorizedException('Invalid credentials or token expired.');
    }
    const email = req.user.email;
    const me = await this.usersService.getMe(email);

    return new BaseResponseDto(HttpStatus.OK, 'user fetched successfully', me);
  }
}
