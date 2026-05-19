import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Prisma, SuperheroStatus } from 'generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RoleName } from '../common/types/role-name.enum';
import * as bcrypt from 'bcrypt';

type UserWithRoles = Prisma.UserGetPayload<{
  include: {
    roles: true;
    realHeroSuperhero: true;
  };
}>;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private async findActiveByIdWithRoles(id: number): Promise<UserWithRoles> {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      include: { roles: true, realHeroSuperhero: true },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return user;
  }

  private formatUserResponse(user: any) {
    if (!user) return null;
    const {
      passwordHash,
      resetPasswordTokenHash,
      resetPasswordExpiresAt,
      roles,
      ...rest
    } = user;
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
    const usesDefaultUserRole = !roles?.length;

    const user = await this.prisma.user.create({
      data: {
        ...rest,
        passwordHash,
        roles: usesDefaultUserRole
          ? {
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
            }
          : {
              connect: roles.map((roleName) => ({ name: roleName })),
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
    const user = await this.findActiveByIdWithRoles(id);
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
        realHeroSuperhero: true,
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

  async findProfileById(userId: number) {
    const user = await this.findActiveByIdWithRoles(userId);
    return this.formatUserResponse(user);
  }

  async updateProfileById(userId: number, updateProfileDto: UpdateProfileDto) {
    await this.findActiveByIdWithRoles(userId);

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: updateProfileDto.name.trim(),
        surname: updateProfileDto.surname.trim(),
      },
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

  async setRealHeroStatus(
    userId: number,
    enable: boolean,
    convertedById: number,
  ) {
    const user = await this.findActiveByIdWithRoles(userId);

    const heroName = `${user.name} ${user.surname}`.trim() || 'Superhéroe real';

    if (enable) {
      if (user.isRealHero) {
        return {
          message: 'El usuario ya es un superhéroe real.',
        };
      }

      let hero = user.realHeroSuperhero;

      if (hero) {
        await this.prisma.superhero.update({
          where: { id: hero.id },
          data: {
            status: SuperheroStatus.PUBLISHED,
            deletedAt: null,
            name: heroName,
            description: `Superhéroe real creado desde el panel de administración para ${heroName}.`,
            quote: 'Comprometido con el Equipo PUCH.',
          },
        });
      } else {
        const slug = await this.generateUniqueHeroSlug(heroName);
        hero = await this.prisma.superhero.create({
          data: {
            name: heroName,
            slug,
            description: `Superhéroe real creado desde el panel de administración para ${heroName}.`,
            quote: 'Comprometido con el Equipo PUCH.',
            country: null,
            sortOrder: 0,
            status: SuperheroStatus.PUBLISHED,
            createdById: convertedById,
          },
        });
      }

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          isRealHero: true,
          realHeroSuperheroId: hero?.id,
        },
      });

      return {
        message: 'Usuario convertido en superhéroe real.',
      };
    }

    if (!user.isRealHero) {
      return {
        message: 'El usuario ya no era un superhéroe real.',
      };
    }

    if (user.realHeroSuperhero) {
      await this.prisma.superhero.update({
        where: { id: user.realHeroSuperhero.id },
        data: {
          status: SuperheroStatus.HIDDEN,
          deletedAt: new Date(),
        },
      });
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isRealHero: false,
      },
    });

    return {
      message: 'Superhéroe real desactivado.',
    };
  }

  private buildHeroSlugBase(name: string): string {
    const normalized = name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return normalized || 'superheroe';
  }

  private async generateUniqueHeroSlug(name: string): Promise<string> {
    const baseSlug = this.buildHeroSlugBase(name);

    const where: Prisma.SuperheroWhereInput = {
      OR: [{ slug: baseSlug }, { slug: { startsWith: `${baseSlug}-` } }],
    };

    const existingSlugs = await this.prisma.superhero.findMany({
      where,
      select: { slug: true },
    });

    const slugSet = new Set(existingSlugs.map((item) => item.slug));

    if (!slugSet.has(baseSlug)) {
      return baseSlug;
    }

    let suffix = 2;
    while (slugSet.has(`${baseSlug}-${suffix}`)) {
      suffix += 1;
    }

    return `${baseSlug}-${suffix}`;
  }
}
