import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, type Region } from 'generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRegionDto } from './dto/create-region.dto';
import { ListRegionsQueryDto } from './dto/list-regions-query.dto';
import { UpdateRegionDto } from './dto/update-region.dto';

type RegionWithBooksCount = Region & {
  booksCount: number;
};

@Injectable()
export class RegionsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForAdmin(
    query: ListRegionsQueryDto,
  ): Promise<RegionWithBooksCount[]> {
    const where: Prisma.RegionWhereInput = {
      deletedAt: null,
    };

    const searchTerm = query.search?.trim();
    if (searchTerm) {
      where.OR = [
        {
          name: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        {
          email: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
      ];
    }

    const regions = await this.prisma.region.findMany({
      where,
      orderBy: {
        name: 'asc',
      },
      include: {
        _count: {
          select: { humanBooks: { where: { deletedAt: null } } },
        },
      },
    });

    return regions.map((region) => ({
      ...region,
      booksCount: region._count.humanBooks,
    }));
  }

  async findOptions() {
    const regions = await this.prisma.region.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    });

    return regions;
  }

  async create(createRegionDto: CreateRegionDto) {
    try {
      const region = await this.prisma.region.create({
        data: {
          name: createRegionDto.name.trim(),
          address: createRegionDto.address.trim(),
          email: createRegionDto.email.trim().toLowerCase(),
        },
      });

      return {
        message: 'Delegación creada correctamente',
        region: {
          ...region,
          booksCount: 0,
        },
      };
    } catch (error) {
      this.handleUniqueConstraint(error);
      throw error;
    }
  }

  async update(id: number, updateRegionDto: UpdateRegionDto) {
    await this.findActiveById(id);

    const updateData: Prisma.RegionUpdateInput = {};

    if (updateRegionDto.name !== undefined) {
      updateData.name = updateRegionDto.name.trim();
    }

    if (updateRegionDto.address !== undefined) {
      updateData.address = updateRegionDto.address.trim();
    }

    if (updateRegionDto.email !== undefined) {
      updateData.email = updateRegionDto.email.trim().toLowerCase();
    }

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException(
        'Debes enviar al menos un campo para actualizar',
      );
    }

    try {
      const region = await this.prisma.region.update({
        where: { id },
        data: updateData,
      });

      return {
        message: 'Delegación actualizada correctamente',
        region: {
          ...region,
          booksCount: 0,
        },
      };
    } catch (error) {
      this.handleUniqueConstraint(error);
      throw error;
    }
  }

  async remove(id: number) {
    await this.findActiveById(id);

    await this.prisma.region.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return {
      message: 'Delegación eliminada correctamente',
    };
  }

  private async findActiveById(id: number): Promise<Region> {
    const region = await this.prisma.region.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!region) {
      throw new NotFoundException(`Delegación con id ${id} no encontrada`);
    }

    return region;
  }

  private handleUniqueConstraint(error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      const target = Array.isArray(error.meta?.target)
        ? error.meta.target.join(', ')
        : '';

      if (target.includes('name')) {
        throw new ConflictException('Ya existe una delegación con ese nombre');
      }

      if (target.includes('email')) {
        throw new ConflictException('Ya existe una delegación con ese email');
      }

      throw new ConflictException('Ya existe una delegación con esos datos');
    }
  }
}
