import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { Prisma } from 'generated/prisma/client';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

type UserWithRoles = Prisma.UserGetPayload<{
  include: {
    roles: true;
  };
}>;

type SafeUserWithRoles = Omit<UserWithRoles, 'passwordHash'>;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private async validateUser(
    email: string,
    password: string,
  ): Promise<SafeUserWithRoles> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
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
    return this.buildAuthResponse(user);
  }

  private buildAuthResponse(user: SafeUserWithRoles) {
    const roles = this.getNormalizedRoles(user.roles);
    const payload = {
      sub: user.id,
      email: user.email,
      roles,
    };

    return {
      message: 'Login correcto',
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        roles,
      },
    };
  }

  private getNormalizedRoles(roles: Array<{ name: string }>): string[] {
    return roles.map((role) => role.name.toUpperCase());
  }
}
