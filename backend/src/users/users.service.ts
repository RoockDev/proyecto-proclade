import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import type { Prisma } from 'generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RoleName } from '../common/types/role-name.enum';
import * as bcrypt from 'bcrypt';

type UserWithRoles = Prisma.UserGetPayload<{
  include: {
    roles: true;
  };
}>;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private formatUserResponse(user: any) {
    if (!user) return null;
    const { passwordHash, roles, ...rest } = user;
    return {
      ...rest,

      roles: roles?.map((r: any) => r.name) || [],
    };
  }

  async create(createUserDto: CreateUserDto) {
    const { password, roles, ...rest } = createUserDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email: rest.email },
    });

    if (existingUser) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const rolesToConnect = roles?.length ? roles : [RoleName.USER];

    const user = await this.prisma.user.create({
      data: {
        ...rest,
        passwordHash,
        roles: {
          connect: rolesToConnect.map((roleName) => ({ name: roleName })),
        },
      },
      include: { roles: true },
    });

    return this.formatUserResponse(user);
  }

  async findAll(includeDeleted = false) {
    const users = await this.prisma.user.findMany({
      where: includeDeleted ? {} : { deletedAt: null },
      include: { roles: true },
    });
    return users.map((u) => this.formatUserResponse(u));
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: { roles: true },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return this.formatUserResponse(user);
  }

  async findActiveByEmailWithRoles(
    email: string,
  ): Promise<UserWithRoles | null> {
    return this.prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
      include: {
        roles: true,
      },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.findOne(id);

    const { password, roles, ...rest } = updateUserDto;
    const dataToUpdate: any = { ...rest };

    if (rest.email) {
      const existingEmail = await this.prisma.user.findFirst({
        where: { email: rest.email, id: { not: id } },
      });
      if (existingEmail) {
        throw new ConflictException(
          'El correo electrónico ya está en uso por otro usuario',
        );
      }
    }

    if (password) {
      dataToUpdate.passwordHash = await bcrypt.hash(password, 10);
    }

    if (roles) {
      // usamos el set al no crear la tabla intermedia explícitmanente
      dataToUpdate.roles = {
        set: roles.map((roleName) => ({ name: roleName })),
      };
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: dataToUpdate,
      include: { roles: true },
    });

    return this.formatUserResponse(updatedUser);
  }

  async remove(id: number) {
    await this.findOne(id);

    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return null;
  }

  async restore(id: number) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: { not: null } },
    });

    if (!user) {
      throw new NotFoundException(
        `Usuario con ID ${id} no encontrado o no eliminado`,
      );
    }

    const restoredUser = await this.prisma.user.update({
      where: { id },
      data: { deletedAt: null },
      include: { roles: true },
    });
    return this.formatUserResponse(restoredUser);
  }
}
