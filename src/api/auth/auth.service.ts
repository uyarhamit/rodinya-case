import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserResponseDto } from '../users/dto/response/user-response.dto';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { LoginResponseDto } from './dto/response/login-response.dto';
import { RefreshTokenDto } from './dto/resfresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Registers a new user by creating their account in the user service.
   *
   * @param {CreateUserDto} createUserDto - An object containing user details required for registration.
   * @return {Promise<UserResponseDto>} A promise that resolves to the response data of the registered user.
   */
  async register(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const existingUser = await this.userService.findByEmail(
      createUserDto.email,
    );

    if (existingUser) {
      throw new ConflictException('Email already exists.');
    }

    createUserDto.passwordHash = await bcrypt.hash(createUserDto.password, 12);
    return await this.userService.create(createUserDto);
  }

  /**
   * Handles user login by verifying credentials and generating authentication tokens.
   *
   * @param {string} email - The email address of the user attempting to log in.
   * @param {string} password - The password provided by the user for authentication.
   * @return {Promise<LoginResponseDto>} A promise that resolves to a `LoginResponseDto` object containing access and refresh tokens upon successful login.
   * @throws {NotFoundException} If no user is found with the provided email address.
   * @throws {UnauthorizedException} If the provided password is incorrect.
   */
  async login(email: string, password: string): Promise<LoginResponseDto> {
    const user = await this.userService.login(email);
    if (!user) {
      throw new NotFoundException('user not found');
    }

    const checkPassword = await bcrypt.compare(password, user.passwordHash);

    if (!checkPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { accessToken, refreshToken, refreshTokenExpiresAt } =
      await this.generateTokens(user._id.toString(), user.email, user.role);

    return new LoginResponseDto({
      accessToken,
      refreshToken,
      refreshTokenExpiresAt,
    });
  }

  /**
   * Refreshes the authentication tokens for a user based on their identifier.
   *
   * @param {string} id - The unique identifier of the user for whom the tokens are being refreshed.
   * @return {Promise<LoginResponseDto>} A promise that resolves to an object containing the new access token, refresh token, and their expiration details.
   * @throws {NotFoundException} If the user is not found in the system.
   */
  async refreshToken(id: string): Promise<LoginResponseDto> {
    const user = await this.userService.findById(id);
    if (!user) {
      throw new NotFoundException('user not found');
    }

    const { accessToken, refreshToken, refreshTokenExpiresAt } =
      await this.generateTokens(user._id.toString(), user.email, user.role);

    return new LoginResponseDto({
      accessToken,
      refreshToken,
      refreshTokenExpiresAt,
    });
  }

  private async generateTokens(
    userId: string,
    email: string,
    role: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    refreshTokenExpiresAt: Date;
  }> {
    const accessToken = this.jwtService.sign(
      { email, sub: userId, role, type: 'access' },
      {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'), // Explicitly pass secret for debugging
        expiresIn: `${this.configService.get<number>('JWT_ACCESS_EXPIRES_IN')}m`,
      },
    );

    const refreshTokenPayload = { sub: userId, type: 'refresh' };
    const refreshTokenSecret =
      this.configService.get<string>('JWT_REFRESH_SECRET');

    const refreshToken = this.jwtService.sign(refreshTokenPayload, {
      secret: refreshTokenSecret, // Explicitly pass secret for debugging
      expiresIn: `${this.configService.get<number>('JWT_REFRESH_EXPIRES_IN')}d`,
    });

    const refreshTokenExpiresAt = new Date();
    refreshTokenExpiresAt.setDate(
      refreshTokenExpiresAt.getDate() +
        parseInt(
          this.configService.get<string>(
            'JWT_REFRESH_TOKEN_EXPIRATION_DAYS',
            '7',
          ),
        ),
    );

    return { accessToken, refreshToken, refreshTokenExpiresAt };
  }
}
