import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NewsStatus, type News, type Prisma } from 'generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { ListNewsQueryDto } from './dto/list-news-query.dto';
import { UpdateNewsDto } from './dto/update-news.dto';

@Injectable()
export class NewsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllPublished(query: ListNewsQueryDto) {
    return this.prisma.news.findMany({
      where: {
        status: NewsStatus.PUBLISHED,
        deletedAt: null,
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: query.limit,
    });
  }

  async findPublishedBySlug(slug: string) {
    const news = await this.prisma.news.findFirst({
      where: {
        slug,
        status: NewsStatus.PUBLISHED,
        deletedAt: null,
      },
    });

    if (!news) {
      throw new NotFoundException('Noticia no encontrada');
    }

    return news;
  }

  async findAllForAdmin() {
    return this.prisma.news.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async create(createNewsDto: CreateNewsDto, createdById: number) {
    const status = createNewsDto.status ?? NewsStatus.DRAFT;
    // El slug se calcula siempre en backend para evitar inconsistencias y edición manual desde cliente.
    const slug = await this.generateUniqueSlug(createNewsDto.title);

    const news = await this.prisma.news.create({
      data: {
        title: createNewsDto.title,
        slug,
        excerpt: createNewsDto.excerpt,
        content: createNewsDto.content,
        imageUrl: createNewsDto.imageUrl,
        status,
        publishedAt: status === NewsStatus.PUBLISHED ? new Date() : null,
        createdById,
      },
    });

    return {
      message: 'Noticia creada correctamente',
      news,
    };
  }

  async update(id: number, updateNewsDto: UpdateNewsDto) {
    const currentNews = await this.findActiveById(id);
    const updateData: Prisma.NewsUpdateInput = {};

    if (updateNewsDto.title !== undefined) {
      updateData.title = updateNewsDto.title;

      // Regla de negocio HU-20: si la noticia está en DRAFT, el cambio de título puede recalcular slug.
      if (currentNews.status === NewsStatus.DRAFT) {
        updateData.slug = await this.generateUniqueSlug(
          updateNewsDto.title,
          id,
        );
      }
    }

    if (updateNewsDto.excerpt !== undefined) {
      updateData.excerpt = updateNewsDto.excerpt;
    }

    if (updateNewsDto.content !== undefined) {
      updateData.content = updateNewsDto.content;
    }

    if (updateNewsDto.imageUrl !== undefined) {
      updateData.imageUrl = updateNewsDto.imageUrl;
    }

    if (updateNewsDto.status !== undefined) {
      updateData.status = updateNewsDto.status;
    }

    const nextStatus = updateNewsDto.status ?? currentNews.status;

    if (
      nextStatus === NewsStatus.PUBLISHED &&
      currentNews.publishedAt === null
    ) {
      // Solo se asigna fecha de publicación la primera vez; luego se conserva como histórico.
      updateData.publishedAt = new Date();
    }

    if (Object.keys(updateData).length === 0) {
      throw new BadRequestException(
        'Debes enviar al menos un campo para actualizar',
      );
    }

    const news = await this.prisma.news.update({
      where: { id },
      data: updateData,
    });

    return {
      message: 'Noticia actualizada correctamente',
      news,
    };
  }

  async remove(id: number) {
    await this.findActiveById(id);

    await this.prisma.news.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return {
      message: 'Noticia eliminada correctamente',
    };
  }

  private async findActiveById(id: number): Promise<News> {
    const news = await this.prisma.news.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!news) {
      throw new NotFoundException(`Noticia con id ${id} no encontrada`);
    }

    return news;
  }

  /**
   * Genera un slug único a partir del título.
   * Si el baseSlug ya existe, añade sufijos incrementales: -2, -3, -4...
   * `excludedId` evita contar la propia noticia durante una actualización.
   */
  private async generateUniqueSlug(title: string, excludedId?: number) {
    const baseSlug = this.buildBaseSlug(title);

    const where: Prisma.NewsWhereInput = {
      OR: [{ slug: baseSlug }, { slug: { startsWith: `${baseSlug}-` } }],
    };

    if (excludedId !== undefined) {
      where.id = {
        not: excludedId,
      };
    }

    const existingSlugs = await this.prisma.news.findMany({
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

  /**
   * Convierte un título legible en un identificador URL-friendly.
   * Ejemplo: "Título de Prueba!" -> "titulo-de-prueba"
   * Esto mejora el SEO y evita IDs públicos en la ruta
  
   */
  private buildBaseSlug(title: string): string {
    const normalized = title
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return normalized || 'noticia';
  }
}
