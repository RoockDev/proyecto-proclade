import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'crypto';
import type { Prisma } from 'generated/prisma/client';
import { RoleName } from '../common/types/role-name.enum';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { GoogleSignInDto } from './dto/google-sign-in.dto';
import { GoogleAuthService } from './google/google-auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

type UserWithRoles = Prisma.UserGetPayload<{
  include: {
    roles: true;
    realHeroSuperhero: true;
  };
}>;

type SafeUserWithRoles = Omit<UserWithRoles, 'passwordHash'>;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly googleAuthService: GoogleAuthService,
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
  ) {}

  private async validateUser(
    email: string,
    password: string,
  ): Promise<SafeUserWithRoles> {
    const user = await this.usersService.findActiveByEmailWithRoles(email);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (user.google) {
      throw new UnauthorizedException(
        'Esta cuenta debe iniciar sesión con Google',
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    return this.buildAuthResponse(user, 'Login correcto');
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: registerDto.email,
      },
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        passwordHash: hashedPassword,
        name: registerDto.name,
        surname: registerDto.surname,
        roles: {
          connectOrCreate: [
            {
              where: {
                name: RoleName.USER,
              },
              create: {
                name: RoleName.USER,
              },
            },
          ],
        },
      },
      include: {
        roles: true,
        realHeroSuperhero: true,
      },
    });

    const { passwordHash, ...safeUser } = user;
    return this.buildAuthResponse(
      safeUser,
      'Registro completado correctamente',
    );
  }

  async googleSignIn(googleSignInDto: GoogleSignInDto) {
    const googlePayload = await this.googleAuthService.verifyIdToken(
      googleSignInDto.idToken,
    );

    const email = googlePayload.email?.trim().toLowerCase();
    if (!email || googlePayload.emailVerified !== true) {
      throw new UnauthorizedException('No se pudo iniciar sesión con Google');
    }

    let user = await this.usersService.findActiveByEmailWithRoles(email);

    if (!user) {
      const name = googlePayload.name?.trim() || 'Usuario';
      const surname = googlePayload.surname?.trim() || 'Google';
      const randomPassword = randomBytes(24).toString('hex');
      const passwordHash = await bcrypt.hash(randomPassword, 10);

      user = await this.prisma.user.create({
        data: {
          email,
          passwordHash,
          name,
          surname,
          google: true,
          roles: {
            connectOrCreate: [
              {
                where: {
                  name: RoleName.USER,
                },
                create: {
                  name: RoleName.USER,
                },
              },
            ],
          },
        },
        include: {
          roles: true,
          realHeroSuperhero: true,
        },
      });
    }

    const { passwordHash, ...safeUser } = user;
    return this.buildAuthResponse(safeUser, 'Google Sign-In exitoso');
  }

  private buildAuthResponse(user: SafeUserWithRoles, message: string) {
    const roles = this.getNormalizedRoles(user.roles);
    const payload = {
      sub: user.id,
      email: user.email,
      roles,
    };

    return {
      message,
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        surname: user.surname,
        roles,
      },
    };
  }

  private getNormalizedRoles(roles: Array<{ name: string }>): string[] {
    return roles.map((role) => role.name.toUpperCase());
  }

  // ── Password Recovery ──────────────────────────────────────────────

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const genericMessage =
      'Si el correo es válido, recibirás un enlace para restablecer la contraseña.';

    const user = await this.prisma.user.findUnique({
      where: { email: forgotPasswordDto.email, deletedAt: null },
    });

    // No revelar si el email existe o no (regla 3.4)
    if (!user || user.google) {
      this.logger.log(
        `Solicitud de recuperación ignorada para: ${forgotPasswordDto.email}`,
      );
      return { message: genericMessage };
    }

    // Generar token seguro
    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawToken);

    const ttlMinutes = Number(
      this.configService.get<string>('RESET_PASSWORD_TTL_MINUTES') || '30',
    );
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    // Guardar token hasheado (invalida solicitudes anteriores)
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordTokenHash: tokenHash,
        resetPasswordExpiresAt: expiresAt,
      },
    });

    // Enviar email con token en claro (solo viaja en el enlace)
    try {
      await this.mailService.sendResetPasswordEmail(user.email, rawToken);
    } catch {
      this.logger.error(
        `No se pudo enviar el email de recuperación a ${user.email}`,
      );
    }

    this.logger.log(`Token de recuperación generado para: ${user.email}`);
    return { message: genericMessage };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const tokenHash = this.hashToken(resetPasswordDto.token);

    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordTokenHash: tokenHash,
        deletedAt: null,
      },
    });

    if (!user) {
      throw new BadRequestException(
        'El enlace de recuperación no es válido o ya fue utilizado.',
      );
    }

    if (
      !user.resetPasswordExpiresAt ||
      user.resetPasswordExpiresAt < new Date()
    ) {
      // Limpiar token expirado
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordTokenHash: null,
          resetPasswordExpiresAt: null,
        },
      });
      throw new BadRequestException(
        'El enlace de recuperación ha expirado. Solicita uno nuevo.',
      );
    }

    // Actualizar contraseña e invalidar token
    const newPasswordHash = await bcrypt.hash(resetPasswordDto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
        resetPasswordTokenHash: null,
        resetPasswordExpiresAt: null,
      },
    });

    this.logger.log(`Contraseña restablecida para usuario ID: ${user.id}`);
    return { message: 'Contraseña cambiada con éxito' };
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (user.google) {
      throw new BadRequestException(
        'Las cuentas de Google deben cambiar la contraseña desde su proveedor.',
      );
    }

    if (
      changePasswordDto.newPassword !== changePasswordDto.confirmNewPassword
    ) {
      throw new BadRequestException(
        'La confirmación de contraseña no coincide con la nueva contraseña',
      );
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.passwordHash,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('La contraseña actual no es correcta');
    }

    const isSameAsCurrent = await bcrypt.compare(
      changePasswordDto.newPassword,
      user.passwordHash,
    );

    if (isSameAsCurrent) {
      throw new BadRequestException(
        'La nueva contraseña debe ser diferente a la actual',
      );
    }

    const newPasswordHash = await bcrypt.hash(
      changePasswordDto.newPassword,
      10,
    );

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
        resetPasswordTokenHash: null,
        resetPasswordExpiresAt: null,
      },
    });

    this.logger.log(`Contraseña actualizada para usuario ID: ${user.id}`);
    return { message: 'Contraseña actualizada correctamente' };
  }
}
