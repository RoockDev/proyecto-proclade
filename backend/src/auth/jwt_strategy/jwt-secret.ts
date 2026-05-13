import { ConfigService } from '@nestjs/config';

export const getRequiredJwtSecret = (configService: ConfigService): string => {
  const jwtSecret = configService.get<string>('JWT_SECRET')?.trim();

  if (!jwtSecret) {
    throw new Error('JWT_SECRET es obligatorio para arrancar el backend');
  }

  return jwtSecret;
};
