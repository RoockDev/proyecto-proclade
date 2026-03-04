import {
  Injectable,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import { NewsStatus } from 'generated/prisma/client';
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

  async create(_createNewsDto: CreateNewsDto, createdById: number) {
    // Bloque siguiente: aquí implementaremos slug, publicación y persistencia completa.
    throw new NotImplementedException(
      `Pendiente implementar creación de noticia para usuario ${createdById}`,
    );
  }

  async update(id: number, _updateNewsDto: UpdateNewsDto) {
    // Bloque siguiente: aquí implementaremos reglas DRAFT/PUBLISHED y actualización segura.
    throw new NotImplementedException(
      `Pendiente implementar actualización de noticia ${id}`,
    );
  }

  async remove(id: number) {
    // Bloque siguiente: aquí implementaremos el borrado lógico (deletedAt).
    throw new NotImplementedException(
      `Pendiente implementar borrado lógico de noticia ${id}`,
    );
  }
}
