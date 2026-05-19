import * as bcrypt from 'bcrypt';
import { RoleName } from '../common/types/role-name.enum';
import { AuthService } from './auth.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;

  const prismaMock = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  const jwtServiceMock = {
    sign: jest.fn().mockReturnValue('signed-jwt-token'),
  };

  const configServiceMock = {
    get: jest.fn(),
  };

  const usersServiceMock = {
    findActiveByEmailWithRoles: jest.fn(),
  };

  const mailServiceMock = {
    sendResetPasswordEmail: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

    service = new AuthService(
      prismaMock as never,
      jwtServiceMock as never,
      configServiceMock as never,
      usersServiceMock as never,
      mailServiceMock as never,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('registra usuarios creando el rol USER si la base está vacía', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockImplementation(async (args) => ({
      id: 101,
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

    const result = await service.register({
      email: 'nuevo.usuario@test.local',
      password: 'Secret123!',
      name: 'Nuevo',
      surname: 'Usuario',
      privacyAccepted: true,
    });

    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: {
        email: 'nuevo.usuario@test.local',
        passwordHash: 'hashed-password',
        name: 'Nuevo',
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
      include: {
        roles: true,
        realHeroSuperhero: true,
      },
    });
    expect(result.message).toBe('Registro completado correctamente');
    expect(result.user.roles).toEqual([RoleName.USER]);
    expect(jwtServiceMock.sign).toHaveBeenCalledWith({
      sub: 101,
      email: 'nuevo.usuario@test.local',
      roles: [RoleName.USER],
    });
  });
});
