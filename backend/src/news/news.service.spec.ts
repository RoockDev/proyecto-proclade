import { BadRequestException } from '@nestjs/common';
import { NewsStatus, type News } from 'generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NewsImageStorageService } from './news-image-storage.service';
import { NewsService } from './news.service';

jest.mock(
  'generated/prisma/client',
  () => ({
    NewsStatus: {
      DRAFT: 'DRAFT',
      PUBLISHED: 'PUBLISHED',
    },
    PrismaClient: class PrismaClient {},
  }),
  { virtual: true },
);

type NewsRecord = News;

const makeNews = (overrides: Partial<NewsRecord> = {}): NewsRecord => ({
  id: 1,
  title: 'Titulo base',
  slug: 'titulo-base',
  excerpt:
    'Este resumen tiene mas de cuarenta caracteres para cumplir validaciones.',
  content: 'Contenido de prueba de noticia.',
  imageUrl: null,
  status: NewsStatus.DRAFT,
  publishedAt: null,
  createdById: 10,
  deletedAt: null,
  createdAt: new Date('2026-03-04T00:00:00.000Z'),
  updatedAt: new Date('2026-03-04T00:00:00.000Z'),
  ...overrides,
});

describe('NewsService', () => {
  let service: NewsService;

  const prismaMock = {
    news: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  } as unknown as PrismaService;

  const newsImageStorageServiceMock = {
    removeNewsImage: jest.fn(),
  } as unknown as NewsImageStorageService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new NewsService(prismaMock, newsImageStorageServiceMock);
  });

  describe('buildBaseSlug (private)', () => {
    it('normaliza acentos, simbolos y espacios', () => {
      // Accedemos por "as any" porque el metodo es privado y queremos probar su regla de negocio.
      const slug = (service as any).buildBaseSlug(
        '  Título de Prueba!!! 2026  ',
      );
      expect(slug).toBe('titulo-de-prueba-2026');
    });

    it('usa valor por defecto cuando no hay caracteres validos', () => {
      const slug = (service as any).buildBaseSlug('###');
      expect(slug).toBe('noticia');
    });
  });

  describe('generateUniqueSlug (private)', () => {
    it('devuelve baseSlug cuando no hay colisiones', async () => {
      (prismaMock.news.findMany as jest.Mock).mockResolvedValue([]);

      const slug = await (service as any).generateUniqueSlug('Nueva Noticia');

      expect(slug).toBe('nueva-noticia');
      expect(prismaMock.news.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { slug: 'nueva-noticia' },
            { slug: { startsWith: 'nueva-noticia-' } },
          ],
        },
        select: { slug: true },
      });
    });

    it('aplica sufijo incremental cuando el slug ya existe', async () => {
      (prismaMock.news.findMany as jest.Mock).mockResolvedValue([
        { slug: 'nueva-noticia' },
        { slug: 'nueva-noticia-2' },
      ]);

      const slug = await (service as any).generateUniqueSlug('Nueva Noticia');

      expect(slug).toBe('nueva-noticia-3');
    });

    it('excluye la propia noticia al actualizar', async () => {
      (prismaMock.news.findMany as jest.Mock).mockResolvedValue([]);

      await (service as any).generateUniqueSlug('Nueva Noticia', 99);

      expect(prismaMock.news.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { slug: 'nueva-noticia' },
            { slug: { startsWith: 'nueva-noticia-' } },
          ],
          id: { not: 99 },
        },
        select: { slug: true },
      });
    });
  });

  describe('create', () => {
    it('crea en DRAFT por defecto y sin publishedAt', async () => {
      (prismaMock.news.findMany as jest.Mock).mockResolvedValue([]);
      (prismaMock.news.create as jest.Mock).mockImplementation(async (args) =>
        makeNews({
          ...args.data,
          id: 100,
          publishedAt: null,
          status: NewsStatus.DRAFT,
        }),
      );

      const result = await service.create(
        {
          title: 'Noticia de prueba',
          excerpt:
            'Este resumen supera el minimo de cuarenta caracteres sin problema.',
          content: 'Contenido de prueba',
        },
        10,
      );

      expect(prismaMock.news.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'Noticia de prueba',
          slug: 'noticia-de-prueba',
          status: NewsStatus.DRAFT,
          publishedAt: null,
          createdById: 10,
        }),
      });
      expect(result.message).toBe('Noticia creada correctamente');
    });

    it('si viene PUBLISHED asigna publishedAt', async () => {
      (prismaMock.news.findMany as jest.Mock).mockResolvedValue([]);
      (prismaMock.news.create as jest.Mock).mockImplementation(async (args) =>
        makeNews({
          ...args.data,
          id: 101,
          status: NewsStatus.PUBLISHED,
          publishedAt: args.data.publishedAt,
        }),
      );

      await service.create(
        {
          title: 'Noticia publicada',
          excerpt:
            'Este resumen supera el minimo de cuarenta caracteres para publicar.',
          content: 'Contenido publicado',
          status: NewsStatus.PUBLISHED,
        },
        11,
      );

      expect(prismaMock.news.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: NewsStatus.PUBLISHED,
          publishedAt: expect.any(Date),
        }),
      });
    });
  });

  describe('update', () => {
    it('en DRAFT recalcula slug al cambiar titulo', async () => {
      (prismaMock.news.findFirst as jest.Mock).mockResolvedValue(
        makeNews({ id: 1, status: NewsStatus.DRAFT, slug: 'titulo-viejo' }),
      );
      (prismaMock.news.findMany as jest.Mock).mockResolvedValue([]);
      (prismaMock.news.update as jest.Mock).mockResolvedValue(
        makeNews({
          id: 1,
          title: 'Titulo Nuevo',
          slug: 'titulo-nuevo',
          status: NewsStatus.DRAFT,
        }),
      );

      await service.update(1, { title: 'Titulo Nuevo' });

      expect(prismaMock.news.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          title: 'Titulo Nuevo',
          slug: 'titulo-nuevo',
        }),
      });
    });

    it('en PUBLISHED no recalcula slug aunque cambie el titulo', async () => {
      (prismaMock.news.findFirst as jest.Mock).mockResolvedValue(
        makeNews({
          id: 2,
          status: NewsStatus.PUBLISHED,
          slug: 'slug-publicado',
          publishedAt: new Date('2026-03-04T12:00:00.000Z'),
        }),
      );
      (prismaMock.news.update as jest.Mock).mockResolvedValue(
        makeNews({
          id: 2,
          title: 'Titulo Nuevo Publicado',
          slug: 'slug-publicado',
          status: NewsStatus.PUBLISHED,
        }),
      );

      await service.update(2, { title: 'Titulo Nuevo Publicado' });

      expect(prismaMock.news.update).toHaveBeenCalledWith({
        where: { id: 2 },
        data: { title: 'Titulo Nuevo Publicado' },
      });
    });

    it('al pasar a PUBLISHED con publishedAt null asigna fecha', async () => {
      (prismaMock.news.findFirst as jest.Mock).mockResolvedValue(
        makeNews({ id: 3, status: NewsStatus.DRAFT, publishedAt: null }),
      );
      (prismaMock.news.update as jest.Mock).mockResolvedValue(
        makeNews({
          id: 3,
          status: NewsStatus.PUBLISHED,
          publishedAt: new Date(),
        }),
      );

      await service.update(3, { status: NewsStatus.PUBLISHED });

      expect(prismaMock.news.update).toHaveBeenCalledWith({
        where: { id: 3 },
        data: expect.objectContaining({
          status: NewsStatus.PUBLISHED,
          publishedAt: expect.any(Date),
        }),
      });
    });

    it('si no llega ningun campo lanza BadRequestException', async () => {
      (prismaMock.news.findFirst as jest.Mock).mockResolvedValue(
        makeNews({ id: 4 }),
      );

      await expect(service.update(4, {})).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(prismaMock.news.update).not.toHaveBeenCalled();
    });

    it('borra la imagen anterior cuando cambia imageUrl', async () => {
      (prismaMock.news.findFirst as jest.Mock).mockResolvedValue(
        makeNews({ id: 6, imageUrl: '/uploads/news/news-antigua.png' }),
      );
      (prismaMock.news.update as jest.Mock).mockResolvedValue(
        makeNews({ id: 6, imageUrl: '/uploads/news/news-nueva.png' }),
      );

      await service.update(6, { imageUrl: '/uploads/news/news-nueva.png' });

      expect(newsImageStorageServiceMock.removeNewsImage).toHaveBeenCalledWith(
        '/uploads/news/news-antigua.png',
      );
    });

    it('al limpiar la imagen guarda null y elimina el archivo local previo', async () => {
      (prismaMock.news.findFirst as jest.Mock).mockResolvedValue(
        makeNews({ id: 7, imageUrl: '/uploads/news/news-antigua.png' }),
      );
      (prismaMock.news.update as jest.Mock).mockResolvedValue(
        makeNews({ id: 7, imageUrl: null }),
      );

      await service.update(7, { imageUrl: '' });

      expect(prismaMock.news.update).toHaveBeenCalledWith({
        where: { id: 7 },
        data: { imageUrl: null },
      });
      expect(newsImageStorageServiceMock.removeNewsImage).toHaveBeenCalledWith(
        '/uploads/news/news-antigua.png',
      );
    });
  });

  describe('remove', () => {
    it('aplica borrado logico con deletedAt y limpia la imagen local', async () => {
      (prismaMock.news.findFirst as jest.Mock).mockResolvedValue(
        makeNews({ id: 5, imageUrl: '/uploads/news/news-antigua.png' }),
      );
      (prismaMock.news.update as jest.Mock).mockResolvedValue(
        makeNews({ id: 5, deletedAt: new Date() }),
      );

      const result = await service.remove(5);

      expect(prismaMock.news.update).toHaveBeenCalledWith({
        where: { id: 5 },
        data: {
          deletedAt: expect.any(Date),
          imageUrl: null,
        },
      });
      expect(newsImageStorageServiceMock.removeNewsImage).toHaveBeenCalledWith(
        '/uploads/news/news-antigua.png',
      );
      expect(result).toEqual({ message: 'Noticia eliminada correctamente' });
    });
  });
});
