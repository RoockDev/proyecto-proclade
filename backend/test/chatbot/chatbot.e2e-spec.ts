import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { GlobalExceptionFilter } from '../../src/common/filters/global-exception.filter';
import { TransformInterceptor } from '../../src/common/interceptors/transform.interceptor';
import { PrismaService } from '../../src/prisma/prisma.service';
import { seedChatbotKnowledge } from '../../prisma/seeds/chatbot-knowledge.seed';

type ApiResponseBody<T> = {
  success: boolean;
  message: string;
  data: T | null;
};

describe('Chatbot (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let httpServer: Parameters<typeof request>[0];

  const runId = `hu39-e2e-${Date.now()}`;
  const unknownText = `consulta desconocida ${runId} sin coincidencias`;
  const unknownTextNormalized = normalizeText(unknownText);

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
    httpServer = app.getHttpServer() as Parameters<typeof request>[0];
    await seedChatbotKnowledge(prisma);
  });

  afterAll(async () => {
    await prisma.unresolvedQuestion.deleteMany({
      where: {
        normalizedText: {
          contains: runId,
        },
      },
    });
    await prisma.$disconnect();
    await app.close();
  });

  it('GET /chatbot/health devuelve estado operativo', async () => {
    const response = await request(httpServer)
      .get('/chatbot/health')
      .expect(200);
    const body = parseApiResponse<{
      status: string;
      totalKnowledgeItems: number;
    }>(response.body);

    expect(body.success).toBe(true);
    expect(body.data?.status).toBe('ok');
    expect((body.data?.totalKnowledgeItems ?? 0) > 0).toBe(true);
  });

  it('POST /chatbot/sessions crea o reutiliza una sesión', async () => {
    const firstResponse = await request(httpServer)
      .post('/chatbot/sessions')
      .send({})
      .expect(201);
    const firstBody = parseApiResponse<{ sessionId: string }>(
      firstResponse.body,
    );

    expect(firstBody.success).toBe(true);
    expect(typeof firstBody.data?.sessionId).toBe('string');
    expect(firstBody.data?.sessionId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );

    const secondResponse = await request(httpServer)
      .post('/chatbot/sessions')
      .send({
        sessionId: firstBody.data?.sessionId,
      })
      .expect(201);
    const secondBody = parseApiResponse<{ sessionId: string }>(
      secondResponse.body,
    );

    expect(secondBody.success).toBe(true);
    expect(secondBody.data?.sessionId).toBe(firstBody.data?.sessionId);
  });

  it('POST /chatbot/message responde y registra fallback en preguntas no resueltas', async () => {
    const sessionResponse = await request(httpServer)
      .post('/chatbot/sessions')
      .send({})
      .expect(201);
    const sessionBody = parseApiResponse<{ sessionId: string }>(
      sessionResponse.body,
    );

    const sessionId = sessionBody.data?.sessionId;
    expect(typeof sessionId).toBe('string');

    const knownResponse = await request(httpServer)
      .post('/chatbot/message')
      .send({
        sessionId,
        message: 'como donar',
        pageContext: 'home',
      })
      .expect(201);
    const knownBody = parseApiResponse<{
      replyType: string;
      answer: string;
    }>(knownResponse.body);

    expect(knownBody.success).toBe(true);
    expect(knownBody.data?.replyType).not.toBe('FALLBACK');
    expect((knownBody.data?.answer.length ?? 0) > 0).toBe(true);

    const unknownResponse = await request(httpServer)
      .post('/chatbot/message')
      .send({
        sessionId,
        message: unknownText,
        pageContext: 'home',
      })
      .expect(201);
    const unknownBody = parseApiResponse<{ replyType: string }>(
      unknownResponse.body,
    );

    expect(unknownBody.success).toBe(true);
    expect(unknownBody.data?.replyType).toBe('FALLBACK');

    const unresolvedRecord = await prisma.unresolvedQuestion.findUnique({
      where: {
        normalizedText: unknownTextNormalized,
      },
    });

    expect(unresolvedRecord).not.toBeNull();
    expect(unresolvedRecord?.occurrences).toBeGreaterThanOrEqual(1);
  });
});

function normalizeText(text: string) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ');
}

function parseApiResponse<T>(value: unknown): ApiResponseBody<T> {
  if (!isObject(value)) {
    throw new Error('Respuesta API inválida: body no es un objeto');
  }

  const success = typeof value.success === 'boolean' ? value.success : false;
  const message = typeof value.message === 'string' ? value.message : '';
  const data = ('data' in value ? value.data : null) as T | null;

  return {
    success,
    message,
    data,
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
