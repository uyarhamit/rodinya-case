import { Injectable, UnauthorizedException } from '@nestjs/common'; // Import Logger
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

// Define the interface for the JWT refresh token payload
interface JwtRefreshPayload {
  sub: string; // Subject (typically the user ID)
  type: 'refresh'; // Explicitly define the token type as 'refresh'
  iat: number; // Issued at (Unix timestamp)
  exp: number; // Expiration time (Unix timestamp)
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  /**
   * Validates the provided JWT refresh token payload.
   *
   * @param {JwtRefreshPayload} payload - The payload of the JWT refresh token to validate.
   * @return {JwtRefreshPayload} Returns the validated payload if it is of type 'refresh'.
   * @throws {UnauthorizedException} Throws an exception if the token type is invalid.
   */
  async validate(
    req: Request,
    payload: JwtRefreshPayload,
  ): Promise<JwtRefreshPayload> {
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }
    return payload;
  }
}
