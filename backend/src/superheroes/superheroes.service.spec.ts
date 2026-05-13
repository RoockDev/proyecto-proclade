import { BadRequestException } from '@nestjs/common';
import { SuperheroStatus, type Superhero } from 'generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SuperheroImageStorageService } from './superhero-image-storage.service';
import { SuperheroesService } from './superheroes.service';

jest.mock(
  'generated/prisma/client',
  () => ({
    SuperheroStatus: {
      DRAFT: 'DRAFT',
      PUBLISHED: 'PUBLISHED',
      HIDDEN: 'HIDDEN',
    },
    PrismaClient: class PrismaClient {},
  }),
  { virtual: true },
);

type SuperheroRecord = Superhero;

const makeSuperhero = (
  overrides: Partial<SuperheroRecord> = {},
): SuperheroRecord => ({
  id: 1,
  name: 'Superheroe base',
  slug: 'superheroe-base',
  description:
    'Descripcion de prueba suficientemente larga para cumplir las validaciones actuales.',
  quote: null,
  country: 'Espana',
  imageUrl: null,
  sortOrder: 0,
  status: SuperheroStatus.DRAFT,
  createdById: 10,
  deletedAt: null,
  createdAt: new Date('2026-03-04T00:00:00.000Z'),
  updatedAt: new Date('2026-03-04T00:00:00.000Z'),
  ...overrides,
});

describe('SuperheroesService', () => {
  let service: SuperheroesService;

  const prismaMock = {
    superhero: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      updateMany: jest.fn(),
    },
    $transaction: jest.fn(),
  } as unknown as PrismaService;

  const superheroImageStorageServiceMock = {
    removeImage: jest.fn(),
  } as unknown as SuperheroImageStorageService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SuperheroesService(
      prismaMock,
      superheroImageStorageServiceMock,
    );
  });

  describe('update', () => {
    it('borra la imagen anterior cuando cambia imageUrl', async () => {
      (prismaMock.superhero.findFirst as jest.Mock).mockResolvedValue(
        makeSuperhero({
          id: 4,
          imageUrl: '/uploads/superheroes/imagen-antigua.png',
        }),
      );
      (prismaMock.superhero.update as jest.Mock).mockResolvedValue(
        makeSuperhero({
          id: 4,
          imageUrl: '/uploads/superheroes/imagen-nueva.png',
        }),
      );

      await service.update(4, { imageUrl: '/uploads/superheroes/imagen-nueva.png' });

      expect(superheroImageStorageServiceMock.removeImage).toHaveBeenCalledWith(
        '/uploads/superheroes/imagen-antigua.png',
      );
    });
  });

  describe('removePermanently', () => {
    it('borra el archivo local al eliminar definitivamente un superheroe archivado', async () => {
      (prismaMock.superhero.findUnique as jest.Mock).mockResolvedValue(
        makeSuperhero({
          id: 8,
          deletedAt: new Date('2026-05-01T00:00:00.000Z'),
          imageUrl: '/uploads/superheroes/imagen-final.png',
        }),
      );
      (prismaMock.user.updateMany as jest.Mock).mockResolvedValue({ count: 0 });
      (prismaMock.superhero.delete as jest.Mock).mockResolvedValue(
        makeSuperhero({ id: 8, deletedAt: new Date('2026-05-01T00:00:00.000Z') }),
      );
      (prismaMock.$transaction as jest.Mock).mockResolvedValue([
        { count: 0 },
        makeSuperhero({ id: 8 }),
      ]);

      const result = await service.removePermanently(8);

      expect(prismaMock.$transaction).toHaveBeenCalled();
      expect(superheroImageStorageServiceMock.removeImage).toHaveBeenCalledWith(
        '/uploads/superheroes/imagen-final.png',
      );
      expect(result).toEqual({
        message: 'Superhéroe eliminado definitivamente',
      });
    });

    it('impide el borrado definitivo si el superheroe sigue activo', async () => {
      (prismaMock.superhero.findUnique as jest.Mock).mockResolvedValue(
        makeSuperhero({ id: 9, deletedAt: null }),
      );

      await expect(service.removePermanently(9)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(superheroImageStorageServiceMock.removeImage).not.toHaveBeenCalled();
    });
  });
});
