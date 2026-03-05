import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import { RoleName } from '../../src/common/types/role-name.enum';
import { NewsStatus } from '../../generated/prisma/client';
import { TransformInterceptor } from '../../src/common/interceptors/transform.interceptor';
import { GlobalExceptionFilter } from '../../src/common/filters/global-exception.filter';
import * as bcrypt from 'bcrypt';

describe('News (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  const runId = `hu20-e2e-${Date.now()}`;
  const adminEmail = `admin.${runId}@test.local`;
  const adminPassword = 'Admin123!';
  const userEmail = `user.${runId}@test.local`;
  const userPassword = 'User123!';

  let adminUserId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        stopAtFirstError: true,
      }),
    );
    app.useGlobalInterceptors(new TransformInterceptor());
    app.useGlobalFilters(new GlobalExceptionFilter());

    await app.init();

    prisma = app.get(PrismaService);
    await ensureRolesAndUsers();
  });

  beforeEach(async () => {
    await clearTestNews();
  });

  afterAll(async () => {
    await clearTestNews();
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [adminEmail, userEmail],
        },
      },
    });

    await prisma.$disconnect();
    await app.close();
  });

  it('GET /news devuelve solo publicadas y respeta limit', async () => {
    await createNewsRecord({
      slug: `${runId}-published-old`,
      status: NewsStatus.PUBLISHED,
      publishedAt: new Date('2026-01-10T10:00:00.000Z'),
    });
    const latestPublished = await createNewsRecord({
      slug: `${runId}-published-latest`,
      status: NewsStatus.PUBLISHED,
      publishedAt: new Date('2026-02-10T10:00:00.000Z'),
    });
    await createNewsRecord({
      slug: `${runId}-draft-hidden`,
      status: NewsStatus.DRAFT,
      publishedAt: null,
    });
    await createNewsRecord({
      slug: `${runId}-published-deleted`,
      status: NewsStatus.PUBLISHED,
      publishedAt: new Date('2026-03-01T10:00:00.000Z'),
      deletedAt: new Date('2026-03-02T10:00:00.000Z'),
    });

    const listResponse = await request(app.getHttpServer())
      .get('/news')
      .expect(200);

    expect(listResponse.body.success).toBe(true);
    expect(Array.isArray(listResponse.body.data)).toBe(true);
    expect(listResponse.body.data).toHaveLength(2);
    expect(listResponse.body.data[0].id).toBe(latestPublished.id);

    const limitResponse = await request(app.getHttpServer())
      .get('/news?limit=1')
      .expect(200)
      .expect(({ body }) => {
        expect(body.success).toBe(true);
        expect(body.data).toHaveLength(1);
        expect(body.data[0].id).toBe(latestPublished.id);
      });
  });

  it('GET /news/:slug solo expone noticias publicadas', async () => {
    const published = await createNewsRecord({
      slug: `${runId}-detail-published`,
      status: NewsStatus.PUBLISHED,
      publishedAt: new Date('2026-02-05T10:00:00.000Z'),
    });
    await createNewsRecord({
      slug: `${runId}-detail-draft`,
      status: NewsStatus.DRAFT,
      publishedAt: null,
    });

    const publishedResponse = await request(app.getHttpServer())
      .get(`/news/${published.slug}`)
      .expect(200);

    expect(publishedResponse.body.success).toBe(true);
    expect(publishedResponse.body.data.id).toBe(published.id);

    const draftResponse = await request(app.getHttpServer())
      .get(`/news/${runId}-detail-draft`)
      .expect(404);

    expect(draftResponse.body.success).toBe(false);
  });

  it('GET /admin/news deniega acceso a usuario sin rol ADMIN', async () => {
    const userToken = await loginAndGetToken(userEmail, userPassword);

    const response = await request(app.getHttpServer())
      .get('/admin/news')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);

    expect(response.body.success).toBe(false);
  });

  it('DELETE /admin/news/:id aplica borrado lógico', async () => {
    const adminToken = await loginAndGetToken(adminEmail, adminPassword);
    const record = await createNewsRecord({
      slug: `${runId}-to-delete`,
      status: NewsStatus.PUBLISHED,
      publishedAt: new Date('2026-02-20T10:00:00.000Z'),
    });

    const deleteResponse = await request(app.getHttpServer())
      .delete(`/admin/news/${record.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(deleteResponse.body.success).toBe(true);

    const inDb = await prisma.news.findUnique({
      where: { id: record.id },
    });
    expect(inDb).not.toBeNull();
    expect(inDb?.deletedAt).not.toBeNull();

    const publicList = await request(app.getHttpServer())
      .get('/news')
      .expect(200);
    expect(
      publicList.body.data.some(
        (item: { id: number }) => item.id === record.id,
      ),
    ).toBe(false);
  });

  async function ensureRolesAndUsers() {
    await prisma.role.upsert({
      where: { name: RoleName.ADMIN },
      update: {},
      create: { name: RoleName.ADMIN },
    });

    await prisma.role.upsert({
      where: { name: RoleName.USER },
      update: {},
      create: { name: RoleName.USER },
    });

    const adminPasswordHash = await bcrypt.hash(adminPassword, 10);
    const userPasswordHash = await bcrypt.hash(userPassword, 10);

    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: adminPasswordHash,
        name: 'Admin',
        surname: 'E2E',
        roles: {
          connect: [{ name: RoleName.ADMIN }],
        },
      },
    });
    adminUserId = adminUser.id;

    await prisma.user.create({
      data: {
        email: userEmail,
        passwordHash: userPasswordHash,
        name: 'User',
        surname: 'E2E',
        roles: {
          connect: [{ name: RoleName.USER }],
        },
      },
    });
  }

  async function clearTestNews() {
    await prisma.news.deleteMany({
      where: {
        slug: {
          startsWith: runId,
        },
      },
    });
  }

  async function loginAndGetToken(email: string, password: string) {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(201);

    return response.body?.data?.accessToken as string;
  }

  async function createNewsRecord(params: {
    slug: string;
    status: NewsStatus;
    publishedAt: Date | null;
    deletedAt?: Date | null;
  }) {
    return prisma.news.create({
      data: {
        title: `Titulo ${params.slug}`,
        slug: params.slug,
        excerpt:
          'Este resumen de prueba supera claramente los cuarenta caracteres exigidos.',
        content: `Contenido de prueba para ${params.slug}`,
        status: params.status,
        publishedAt: params.publishedAt,
        deletedAt: params.deletedAt ?? null,
        createdById: adminUserId,
      },
    });
  }
});
