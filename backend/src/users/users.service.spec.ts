import * as bcrypt from 'bcrypt';
import { RoleName } from '../common/types/role-name.enum';
import { UsersService } from './users.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;

  const prismaMock = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    superhero: {
      update: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
    service = new UsersService(prismaMock as never);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('crea usuarios con rol USER por defecto aunque el rol no exista todavia', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockImplementation(async (args) => ({
      id: 201,
      email: args.data.email,
      passwordHash: 'hashed-password',
      name: args.data.name,
      surname: args.data.surname,
      resetPasswordTokenHash: null,
      resetPasswordExpiresAt: null,
      deletedAt: null,
      isRealHero: false,
      realHeroSuperheroId: null,
      realHeroSuperhero: null,
      createdAt: new Date('2026-05-07T00:00:00.000Z'),
      updatedAt: new Date('2026-05-07T00:00:00.000Z'),
      roles: [{ name: RoleName.USER }],
    }));

    const result = await service.create({
      email: 'panel.usuario@test.local',
      password: 'Secret123!',
      name: 'Panel',
      surname: 'Usuario',
    });

    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: {
        email: 'panel.usuario@test.local',
        passwordHash: 'hashed-password',
        name: 'Panel',
        surname: 'Usuario',
        roles: {
          connectOrCreate: [
            {
              where: { name: RoleName.USER },
              create: { name: RoleName.USER },
            },
          ],
        },
      },
      include: { roles: true },
    });
    expect(result.roles).toEqual([RoleName.USER]);
    expect(result).not.toHaveProperty('passwordHash');
    expect(result).not.toHaveProperty('resetPasswordTokenHash');
    expect(result).not.toHaveProperty('resetPasswordExpiresAt');
  });
});
