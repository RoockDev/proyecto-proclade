import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Superhero,
  SuperheroStatus,
  type Prisma,
} from 'generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSuperheroDto } from './dto/create-superhero.dto';
import { ListSuperheroesQueryDto } from './dto/list-superheroes-query.dto';
import { UpdateSuperheroDto } from './dto/update-superhero.dto';
import { UpdateSuperheroStatusDto } from './dto/update-superhero-status.dto';

type SuperheroListData = {
  items: Superhero[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

@Injectable()
export class SuperheroesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllPublished(
    query: ListSuperheroesQueryDto,
  ): Promise<SuperheroListData> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 8;
    const skip = (page - 1) * pageSize;

    const where: Prisma.SuperheroWhereInput = {
      status: SuperheroStatus.PUBLISHED,
      deletedAt: null,
    };

    const [items, total] = await Promise.all([
      this.prisma.superhero.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: pageSize,
      }),
      this.prisma.superhero.count({ where }),
    ]);

    const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);

    return {
      items,
      page,
      pageSize,
      total,
      totalPages,
    };
  }

  async findPublishedBySlug(slug: string) {
    const superhero = await this.prisma.superhero.findFirst({
      where: {
        slug,
        status: SuperheroStatus.PUBLISHED,
        deletedAt: null,
      },
    });

    if (!superhero) {
      throw new NotFoundException('Superhéroe no encontrado');
    }

    return superhero;
  }

  async findAllForAdmin(
    query: ListSuperheroesQueryDto,
  ): Promise<SuperheroListData> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 10;
    const skip = (page - 1) * pageSize;

    const where: Prisma.SuperheroWhereInput = {};
    const deletedFlag = query.deleted === true;

    if (deletedFlag) {
      where.deletedAt = {
        not: null,
      };
    } else {
      where.deletedAt = null;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      where.OR = [
        {
          name: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          country: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.superhero.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: pageSize,
      }),
      this.prisma.superhero.count({
        where,
      }),
    ]);

    const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);

    return {
      items,
      page,
      pageSize,
      total,
      totalPages,
    };
  }

  async create(
    createSuperheroDto: CreateSuperheroDto,
    createdById: number,
    imageUrl?: string,
  ) {
    const slug = await this.generateUniqueSlug(createSuperheroDto.name);
    const status = createSuperheroDto.status ?? SuperheroStatus.DRAFT;

    const superhero = await this.prisma.superhero.create({
      data: {
        name: createSuperheroDto.name,
        slug,
        description: createSuperheroDto.description,
        quote: createSuperheroDto.quote,
        country: createSuperheroDto.country,
        imageUrl: imageUrl ?? createSuperheroDto.imageUrl ?? null,
        sortOrder: createSuperheroDto.sortOrder ?? 0,
        status,
        createdById,
      },
    });

    return {
      message: 'Superhéroe creado correctamente',
      superhero,
    };
  }

  async update(
    id: number,
    updateSuperheroDto: UpdateSuperheroDto,
    imageUrl?: string,
  ) {
    const currentHero = await this.findActiveById(id);
    const updateData: Prisma.SuperheroUpdateInput = {};

    if (updateSuperheroDto.name !== undefined) {
      updateData.name = updateSuperheroDto.name;

      if (currentHero.status === SuperheroStatus.DRAFT) {
        updateData.slug = await this.generateUniqueSlug(
          updateSuperheroDto.name,
          id,
        );
      }
    }

    if (updateSuperheroDto.description !== undefined) {
      updateData.description = updateSuperheroDto.description;
    }

    if (updateSuperheroDto.quote !== undefined) {
      updateData.quote = updateSuperheroDto.quote;
    }

    if (updateSuperheroDto.country !== undefined) {
      updateData.country = updateSuperheroDto.country;
    }

    if (updateSuperheroDto.sortOrder !== undefined) {
      updateData.sortOrder = updateSuperheroDto.sortOrder;
    }

    if (updateSuperheroDto.status !== undefined) {
      updateData.status = updateSuperheroDto.status;
    }

    const finalImageUrl = imageUrl ?? updateSuperheroDto.imageUrl ?? undefined;

    if (finalImageUrl !== undefined) {
      updateData.imageUrl = finalImageUrl;
    }

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException(
        'Debes enviar al menos un campo para actualizar',
      );
    }

    const superhero = await this.prisma.superhero.update({
      where: { id },
      data: updateData,
    });

    return {
      message: 'Superhéroe actualizado correctamente',
      superhero,
    };
  }

  async updateStatus(id: number, updateStatusDto: UpdateSuperheroStatusDto) {
    await this.findActiveById(id);

    await this.prisma.superhero.update({
      where: { id },
      data: {
        status: updateStatusDto.status,
      },
    });

    return {
      message: 'Estado actualizado correctamente',
    };
  }

  async restore(id: number) {
    const superhero = await this.findAnyById(id);

    if (superhero.deletedAt === null) {
      return {
        message: 'Superhéroe ya está activo',
        superhero,
      };
    }

    const restored = await this.prisma.superhero.update({
      where: { id },
      data: {
        deletedAt: null,
        status: SuperheroStatus.DRAFT,
      },
    });

    return {
      message: 'Superhéroe reactivado correctamente',
      superhero: restored,
    };
  }

  async remove(id: number) {
    await this.findActiveById(id);

    await this.prisma.superhero.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return {
      message: 'Superhéroe eliminado correctamente',
    };
  }

  private async findActiveById(id: number): Promise<Superhero> {
    const superhero = await this.prisma.superhero.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!superhero) {
      throw new NotFoundException(`Superhéroe con id ${id} no encontrado`);
    }

    return superhero;
  }

  private async findAnyById(id: number): Promise<Superhero> {
    const superhero = await this.prisma.superhero.findUnique({
      where: {
        id,
      },
    });

    if (!superhero) {
      throw new NotFoundException(`Superhéroe con id ${id} no encontrado`);
    }

    return superhero;
  }

  private async generateUniqueSlug(
    name: string,
    excludedId?: number,
  ): Promise<string> {
    const baseSlug = this.buildBaseSlug(name);

    const where: Prisma.SuperheroWhereInput = {
      OR: [{ slug: baseSlug }, { slug: { startsWith: `${baseSlug}-` } }],
    };

    if (excludedId !== undefined) {
      where.id = {
        not: excludedId,
      };
    }

    const existingSlugs = await this.prisma.superhero.findMany({
      where,
      select: {
        slug: true,
      },
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

  private buildBaseSlug(name: string): string {
    const normalized = name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return normalized || 'superheroe';
  }
}
