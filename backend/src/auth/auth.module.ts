import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt_strategy/jwt.strategy';
import { PrismaModule } from '../prisma/prisma.module';
import { GoogleAuthService } from './google/google-auth.service';
import { MailModule } from '../mail/mail.module';
import { UsersModule } from '../users/users.module';


@Module({
  imports: [
    PrismaModule,
    MailModule,
    forwardRef(() => UsersModule),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: (config.get<string>('JWT_EXPIRES_IN') || '1d') as any, // como estamos usando la versión 11 de @nestjs/jwt, el tipado es mucho más estricto que en la versión 10, por eso hemos puesto as any.
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleAuthService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
