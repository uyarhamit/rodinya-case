import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BaseResponseDto } from '../../shared/dto/base-response.dto';
import { UserResponseDto } from '../users/dto/response/user-response.dto';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/response/login-response.dto';
import { UserRole } from '../users/schema/user.schema';
import { RefreshTokenDto } from './dto/resfresh-token.dto';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new user',
  })
  @ApiBody({
    type: CreateUserDto,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User created successfully',
    type: BaseResponseDto<UserResponseDto>,
    example: {
      statusCode: HttpStatus.CREATED,
      message: 'User created successfully',
      data: {
        id: '123qwe',
        email: 'email@example.com',
        role: UserRole.ADMIN,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    },
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email already exists',
  })
  async register(
    @Body() createUserDto: CreateUserDto,
  ): Promise<BaseResponseDto<UserResponseDto>> {
    const user = await this.authService.register(createUserDto);
    return new BaseResponseDto(
      HttpStatus.CREATED,
      'User created successfully',
      user,
    );
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login a registered user',
  })
  @ApiBody({
    type: LoginDto,
  })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'User logged in successfully',
    type: BaseResponseDto<LoginResponseDto>,
    example: {
      statusCode: HttpStatus.OK,
      message: 'User logged in successfully',
      data: {
        accessToken: 'eyJhbGciOiJ.....',
        refreshToken: 'eyJhbGciOiJ.....',
        refreshTokenExpiresAt: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid credentials',
  })
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<BaseResponseDto<LoginResponseDto>> {
    const user = await this.authService.login(
      loginDto.email,
      loginDto.password,
    );
    return new BaseResponseDto(
      HttpStatus.OK,
      'User logged in successfully',
      user,
    );
  }

  @Post('refresh')
  @UseGuards(JwtRefreshAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
  })
  @ApiBody({
    type: RefreshTokenDto,
  })
  @ApiOkResponse({
    status: HttpStatus.OK,
    description: 'Tokens refreshed successfully.',
    type: BaseResponseDto<LoginResponseDto>,
    example: {
      statusCode: HttpStatus.OK,
      message: 'Token refreshed successfully',
      data: {
        accessToken: 'eyJhbGciOiJ.....',
        refreshToken: 'eyJhbGciOiJ.....',
        refreshTokenExpiresAt: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid refresh token',
  })
  async refreshToken(
    @Request() req,
  ): Promise<BaseResponseDto<LoginResponseDto>> {
    if (!req.user && !req.user.sub) {
      throw new UnauthorizedException('Token not found or expired.');
    }
    const id = req.user.sub;
    const tokens = await this.authService.refreshToken(id);
    return new BaseResponseDto(
      HttpStatus.OK,
      'Token refreshed successfully',
      tokens,
    );
  }
}
