import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import type { Prisma } from 'generated/prisma/client';
import { RoleName } from '../common/types/role-name.enum';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { GoogleSignInDto } from './dto/google-sign-in.dto';
import { GoogleAuthService } from './google/google-auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

type UserWithRoles = Prisma.UserGetPayload<{
  include: {
    roles: true;
  };
}>;

type SafeUserWithRoles = Omit<UserWithRoles, 'passwordHash'>;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly googleAuthService: GoogleAuthService,
    private readonly usersService: UsersService,
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

    const userRole = await this.prisma.role.findUnique({
      where: {
        name: RoleName.USER,
      },
    });

    if (!userRole) {
      throw new NotFoundException('No existe el rol USER');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        passwordHash: hashedPassword,
        name: registerDto.name,
        surname: registerDto.surname,
        roles: {
          connect: {
            id: userRole.id,
          },
        },
      },
      include: {
        roles: true,
      },
    });

    const { passwordHash, ...safeUser } = user;
    return this.buildAuthResponse(safeUser, 'Registro completado correctamente');
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
      const userRole = await this.prisma.role.findUnique({
        where: {
          name: RoleName.USER,
        },
      });

      if (!userRole) {
        throw new NotFoundException('No existe el rol USER');
      }

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
            connect: {
              id: userRole.id,
            },
          },
        },
        include: {
          roles: true,
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
}
