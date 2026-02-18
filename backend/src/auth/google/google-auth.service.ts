import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';

export type GoogleUserPayload = {
  email: string;
  emailVerified: boolean;
  name?: string;
  surname?: string;
  avatarUrl?: string;
};

@Injectable()
export class GoogleAuthService {
  constructor(private readonly configService: ConfigService) {}

  async verifyIdToken(idToken: string): Promise<GoogleUserPayload> {
    const googleClientId = this.configService.get<string>('GOOGLE_CLIENT_ID');

    if (!googleClientId) {
      throw new UnauthorizedException('No se pudo iniciar sesión con Google');
    }

    try {
      const client = new OAuth2Client(googleClientId);
      const ticket = await client.verifyIdToken({
        idToken,
        audience: googleClientId,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new UnauthorizedException('No se pudo iniciar sesión con Google');
      }

      return {
        email: payload.email.trim().toLowerCase(),
        emailVerified: payload.email_verified === true,
        name: payload.given_name || payload.name || undefined,
        surname: payload.family_name || undefined,
        avatarUrl: payload.picture || undefined,
      };
    } catch {
      throw new UnauthorizedException('No se pudo iniciar sesión con Google');
    }
  }
}
