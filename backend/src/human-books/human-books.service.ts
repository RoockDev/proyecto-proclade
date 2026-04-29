import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { HumanBook, Prisma } from 'generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHumanBookDto } from './dto/create-human-book.dto';
import { UpdateHumanBookDto } from './dto/update-human-book.dto';
import {
  HumanBookStorageService,
  type UploadedPdfFile,
} from './human-book-storage.service';

@Injectable()
export class HumanBooksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: HumanBookStorageService,
  ) {}

  async findAllForAdmin() {
    return this.prisma.humanBook.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        region: { select: { id: true, name: true } },
      },
    });
  }

  async findAllPublished() {
    return this.prisma.humanBook.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        region: { select: { id: true, name: true } },
      },
    });
  }

  async findBySlugForDownload(slug: string) {
    const book = await this.prisma.humanBook.findFirst({
      where: { slug, deletedAt: null },
    });

    if (!book) {
      throw new NotFoundException('Libro humano no encontrado');
    }

    return book;
  }

  async create(
    createDto: CreateHumanBookDto,
    file: UploadedPdfFile | undefined,
    createdById: number,
  ) {
    const pdfData = await this.storageService.savePdf(file);
    const slug = await this.generateUniqueSlug(createDto.title);

    await this.validateRegionExists(createDto.regionId);

    const humanBook = await this.prisma.humanBook.create({
      data: {
        name: createDto.name.trim(),
        title: createDto.title.trim(),
        slug,
        regionId: createDto.regionId,
        pdfUrl: pdfData.pdfUrl,
        pdfOriginalName: pdfData.pdfOriginalName,
        pdfMimeType: pdfData.pdfMimeType,
        pdfSize: pdfData.pdfSize,
        createdById,
      },
      include: {
        region: { select: { id: true, name: true } },
      },
    });

    return {
      message: 'Libro humano creado correctamente',
      humanBook,
    };
  }

  async update(
    id: number,
    updateDto: UpdateHumanBookDto,
    file?: UploadedPdfFile,
  ) {
    const current = await this.findActiveById(id);
    const updateData: Prisma.HumanBookUpdateInput = {};

    if (updateDto.name !== undefined) {
      updateData.name = updateDto.name.trim();
    }

    if (updateDto.title !== undefined) {
      updateData.title = updateDto.title.trim();
      updateData.slug = await this.generateUniqueSlug(updateDto.title, id);
    }

    if (updateDto.regionId !== undefined) {
      await this.validateRegionExists(updateDto.regionId);
      updateData.region = { connect: { id: updateDto.regionId } };
    }

    if (file) {
      const pdfData = await this.storageService.savePdf(file);
      updateData.pdfUrl = pdfData.pdfUrl;
      updateData.pdfOriginalName = pdfData.pdfOriginalName;
      updateData.pdfMimeType = pdfData.pdfMimeType;
      updateData.pdfSize = pdfData.pdfSize;

      await this.storageService.removePdf(current.pdfUrl);
    }

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException(
        'Debes enviar al menos un campo para actualizar',
      );
    }

    const humanBook = await this.prisma.humanBook.update({
      where: { id },
      data: updateData,
      include: {
        region: { select: { id: true, name: true } },
      },
    });

    return {
      message: 'Libro humano actualizado correctamente',
      humanBook,
    };
  }

  async remove(id: number) {
    await this.findActiveById(id);

    await this.prisma.humanBook.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return {
      message: 'Libro humano eliminado correctamente',
    };
  }

  private async findActiveById(id: number): Promise<HumanBook> {
    const book = await this.prisma.humanBook.findFirst({
      where: { id, deletedAt: null },
    });

    if (!book) {
      throw new NotFoundException(`Libro humano con id ${id} no encontrado`);
    }

    return book;
  }

  private async validateRegionExists(regionId: number): Promise<void> {
    const region = await this.prisma.region.findFirst({
      where: { id: regionId, deletedAt: null },
    });

    if (!region) {
      throw new NotFoundException(
        `Delegación con id ${regionId} no encontrada`,
      );
    }
  }

  private async generateUniqueSlug(title: string, excludedId?: number) {
    const baseSlug = this.buildBaseSlug(title);

    const where: Prisma.HumanBookWhereInput = {
      OR: [{ slug: baseSlug }, { slug: { startsWith: `${baseSlug}-` } }],
    };

    if (excludedId !== undefined) {
      where.id = { not: excludedId };
    }

    const existingSlugs = await this.prisma.humanBook.findMany({
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

  private buildBaseSlug(title: string): string {
    const normalized = title
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return normalized || 'libro-humano';
  }
}
