import { ChatbotMatchingConfigService } from './chatbot-matching-config.service';
import { ChatbotDynamicContextService } from './chatbot-dynamic-context.service';
import { ChatbotMatchingEngineService } from './chatbot-matching-engine.service';
import { ChatbotOrchestratorService } from './chatbot-orchestrator.service';
import { ChatbotSessionService } from './chatbot-session.service';
import { KnowledgeBaseService } from './knowledge-base.service';
import type { ScoredCandidate } from './types/chatbot.types';
import { UnresolvedQuestionService } from './unresolved-question.service';

describe('ChatbotOrchestratorService', () => {
  const session = {
    id: 101,
    sessionKey: 'f4008f9d-1189-4f58-b44e-a59c38643c11',
  };

  const baseCandidate: ScoredCandidate = {
    candidate: {
      id: 1,
      intentCode: 'DONAR',
      questionCanonical: 'como donar',
      answer: 'Puedes donar en el enlace oficial.',
      tags: ['donar'],
      route: '/colabora',
      ctaLinks: [{ label: 'Donar', to: 'https://example.org/donar' }],
      phrases: ['quiero donar'],
    },
    score: 0.8,
    scoreBreakdown: {
      keywordScore: 0.8,
      fuzzyScore: 0.7,
      semanticScore: 0.6,
      contextScore: 0.5,
      finalScore: 0.8,
    },
  };

  const createService = (
    score: number,
    options?: {
      scoredCandidate?: ScoredCandidate;
      candidates?: ScoredCandidate['candidate'][];
    },
  ) => {
    const saveBotMessageMock = jest.fn().mockResolvedValue({ id: 321 });
    const findOpenSessionByKeyMock = jest.fn().mockResolvedValue(session);
    const getLastDetectedIntentCodeMock = jest.fn().mockResolvedValue(null);

    const sessionServiceMock: Partial<ChatbotSessionService> = {
      resolveOrCreateSession: jest.fn().mockResolvedValue(session),
      findOpenSessionByKey: findOpenSessionByKeyMock,
      getLastDetectedIntentCode: getLastDetectedIntentCodeMock,
      saveUserMessage: jest.fn().mockResolvedValue(undefined),
      getSessionContext: jest.fn().mockResolvedValue({
        lastDetectedIntentCode: null,
        lastMessageAt: new Date(),
        startedAt: new Date(),
      }),
      saveBotMessage: saveBotMessageMock,
      touchSession: jest.fn().mockResolvedValue(undefined),
    };

    const configServiceMock: Partial<ChatbotMatchingConfigService> = {
      getThresholds: jest.fn().mockReturnValue({
        directAnswer: 0.75,
        clarification: 0.5,
      }),
    };

    const scoring: ScoredCandidate = options?.scoredCandidate ?? {
      ...baseCandidate,
      score,
      scoreBreakdown: {
        ...baseCandidate.scoreBreakdown,
        finalScore: score,
      },
    };

    const matchingEngineMock: Partial<ChatbotMatchingEngineService> = {
      scoreCandidates: jest.fn().mockReturnValue([scoring]),
      getConfigSnapshot: jest.fn().mockReturnValue({
        thresholds: {
          directAnswer: 0.75,
          clarification: 0.5,
        },
        weights: {
          keyword: 0.35,
          fuzzy: 0.25,
          semantic: 0.3,
          context: 0.1,
        },
        fuzzyInternalMin: 0.25,
      }),
    };

    const knowledgeServiceMock: Partial<KnowledgeBaseService> = {
      getCandidates: jest
        .fn()
        .mockResolvedValue(options?.candidates ?? [baseCandidate.candidate]),
    };

    const dynamicContextServiceMock: Partial<ChatbotDynamicContextService> = {
      buildIntentReply: jest.fn().mockResolvedValue(null),
    };

    const unresolvedServiceMock: Partial<UnresolvedQuestionService> = {
      register: jest.fn().mockResolvedValue(undefined),
    };

    const service = new ChatbotOrchestratorService(
      sessionServiceMock as ChatbotSessionService,
      configServiceMock as ChatbotMatchingConfigService,
      matchingEngineMock as ChatbotMatchingEngineService,
      dynamicContextServiceMock as ChatbotDynamicContextService,
      knowledgeServiceMock as KnowledgeBaseService,
      unresolvedServiceMock as UnresolvedQuestionService,
    );

    return {
      service,
      sessionServiceMock,
      saveBotMessageMock,
      dynamicContextServiceMock,
      unresolvedServiceMock,
    };
  };

  it('responde DIRECT_ANSWER cuando supera el umbral alto', async () => {
    const { service, unresolvedServiceMock } = createService(0.9);

    const response = await service.sendMessage({
      message: 'como donar',
      pageContext: 'colabora',
    });

    expect(response.replyType).toBe('DIRECT_ANSWER');
    expect(response.confidence).toBe(0.9);
    expect(unresolvedServiceMock.register).not.toHaveBeenCalled();
  });

  it('responde CLARIFICATION cuando está en umbral medio', async () => {
    const { service, unresolvedServiceMock } = createService(0.6);

    const response = await service.sendMessage({
      message: 'me ayudas con donar',
      pageContext: 'colabora',
    });

    expect(response.replyType).toBe('CLARIFICATION');
    expect(response.confidence).toBe(0.6);
    expect(response.answer).toContain('Puedes donar en el enlace oficial.');
    expect(unresolvedServiceMock.register).not.toHaveBeenCalled();
  });

  it('responde de forma conversacional al saludo', async () => {
    const { service } = createService(0.1);

    const response = await service.sendMessage({
      message: 'hola',
      pageContext: 'home',
    });

    expect(response.replyType).toBe('DIRECT_ANSWER');
    expect(response.confidence).toBe(1);
    expect(response.answer.toLowerCase()).toContain('hola');
  });

  it('responde de forma conversacional a saludos alternativos', async () => {
    const { service } = createService(0.1);

    const response = await service.sendMessage({
      message: 'buenas tardes',
      pageContext: 'home',
    });

    expect(response.replyType).toBe('DIRECT_ANSWER');
    expect(response.confidence).toBe(1);
    expect(response.answer.toLowerCase()).toContain('asistente');
  });

  it('responde a small talk sin forzar intent de dominio', async () => {
    const { service } = createService(0.2);

    const response = await service.sendMessage({
      message: 'que tal como estas',
      pageContext: 'home',
    });

    expect(response.replyType).toBe('DIRECT_ANSWER');
    expect(response.confidence).toBe(1);
    expect(response.detectedIntentCode).toBeNull();
    expect(response.answer.toLowerCase()).toContain('estoy genial');
  });

  it('responde de forma conversacional a despedidas alternas', async () => {
    const { service } = createService(0.2);

    const response = await service.sendMessage({
      message: 'hasta pronto',
      pageContext: 'home',
    });

    expect(response.replyType).toBe('DIRECT_ANSWER');
    expect(response.confidence).toBe(1);
    expect(response.answer.toLowerCase()).toContain('gracias');
  });

  it('responde de forma conversacional a peticiones de solicitud/ayuda', async () => {
    const { service } = createService(0.2);

    const response = await service.sendMessage({
      message: 'quiero solicitar informacion',
      pageContext: 'colabora',
    });

    expect(response.replyType).toBe('DIRECT_ANSWER');
    expect(response.confidence).toBe(1);
    expect(response.detectedIntentCode).toBe('CONTACTO');
    expect(response.answer.toLowerCase()).toContain('solicitar');
  });

  it('no deriva a soporte generico cuando la consulta es de dominio con typo', async () => {
    const { service } = createService(0.2);

    const response = await service.sendMessage({
      message: 'quiero info de superheores',
      pageContext: 'home',
    });

    expect(response.detectedIntentCode).not.toBe('CONTACTO');
    expect(response.answer.toLowerCase()).not.toContain(
      'si quieres solicitar informacion',
    );
  });

  it('detecta consultas por nombre de superheroe aunque no incluyan la palabra superheroe', () => {
    const { service } = createService(0.2);

    const preferredIntent = (
      service as unknown as {
        detectPreferredIntentCode: (text: string) => string | null;
      }
    ).detectPreferredIntentCode('dime algo sobre superslash');

    expect(preferredIntent).toBe('SUPERHEROES');
  });

  it('prioriza sugerencias de onboarding al abrir el chatbot', async () => {
    const candidates = [
      baseCandidate.candidate,
      {
        ...baseCandidate.candidate,
        id: 2,
        intentCode: 'CONTACTO',
        questionCanonical: 'quiero solicitar informacion',
      },
      {
        ...baseCandidate.candidate,
        id: 3,
        intentCode: 'COLABORAR',
        questionCanonical: 'como colaborar sin donar',
      },
      {
        ...baseCandidate.candidate,
        id: 4,
        intentCode: 'SUPERHEROES',
        questionCanonical: 'superheroes por pais',
      },
    ];

    const { service } = createService(0.8, { candidates });

    const response = await service.getSuggestions({
      sessionId: session.sessionKey,
      pageContext: 'home',
      limit: 4,
    });

    expect(response.suggestions[0]).toBe('¿Cómo puedo donar?');
    expect(response.suggestions[1]).toBe('Quiero solicitar información');
    expect(response.suggestions[2]).toBe('¿Cómo puedo colaborar sin donar?');
    expect(response.suggestions).toHaveLength(4);
  });

  it('responde FALLBACK y registra pregunta no resuelta cuando queda por debajo del umbral', async () => {
    const { service, unresolvedServiceMock } = createService(0.3);

    const response = await service.sendMessage({
      message: 'pregunta sin match',
      pageContext: 'home',
    });

    expect(response.replyType).toBe('FALLBACK');
    expect(response.confidence).toBe(0);
    expect(unresolvedServiceMock.register).toHaveBeenCalledTimes(1);
  });

  it('responde fallback conversacional para texto sin sentido', async () => {
    const { service, unresolvedServiceMock } = createService(0.3);

    const response = await service.sendMessage({
      message: 'asdasdasdasd',
      pageContext: 'home',
    });

    expect(response.replyType).toBe('FALLBACK');
    expect(response.confidence).toBe(0);
    expect(response.detectedIntentCode).toBeNull();
    expect(response.answer.toLowerCase()).toContain('no he conseguido entender');
    expect(unresolvedServiceMock.register).not.toHaveBeenCalled();
  });

  it('responde fallback para texto sin sentido con varios tokens', async () => {
    const { service, unresolvedServiceMock } = createService(0.3);

    const response = await service.sendMessage({
      message: 'asdasdasd qweqweqwe',
      pageContext: 'home',
    });

    expect(response.replyType).toBe('FALLBACK');
    expect(response.confidence).toBe(0);
    expect(response.detectedIntentCode).toBeNull();
    expect(response.answer.toLowerCase()).toContain('no he conseguido entender');
    expect(unresolvedServiceMock.register).not.toHaveBeenCalled();
  });

  it('guarda scoreBreakdown en meta al persistir mensaje del bot', async () => {
    const { service, saveBotMessageMock } = createService(0.82);

    await service.sendMessage({
      message: 'como donar',
      pageContext: 'colabora',
    });

    expect(saveBotMessageMock).toHaveBeenCalledTimes(1);
    const saveBotCall = saveBotMessageMock.mock.calls[0] as [
      number,
      { meta: unknown },
    ];

    const meta = saveBotCall[1].meta as {
      scoreBreakdown?: {
        finalScore?: number;
      };
    };

    expect(meta.scoreBreakdown?.finalScore).toBe(0.82);
  });

  it('enriquece respuesta con contexto dinamico cuando existe intent detectado', async () => {
    const { service, dynamicContextServiceMock } = createService(0.9);
    (dynamicContextServiceMock.buildIntentReply as jest.Mock).mockResolvedValue(
      {
        answer: 'Respuesta dinamica desde BD',
        ctaLinks: [{ label: 'Ver Superheroes', to: '/superheroes' }],
        suggestions: ['quienes son los superheroes puch'],
      },
    );

    const response = await service.sendMessage({
      message: 'super heroes',
      pageContext: 'superheroes',
    });

    expect(response.replyType).toBe('DIRECT_ANSWER');
    expect(response.answer).toBe('Respuesta dinamica desde BD');
    expect(response.ctaLinks[0]?.to).toBe('/superheroes');
  });

  it('no enriquece con contexto dinamico cuando la respuesta es fallback', async () => {
    const { service, dynamicContextServiceMock } = createService(0.3);
    (dynamicContextServiceMock.buildIntentReply as jest.Mock).mockResolvedValue(
      {
        answer: 'Respuesta dinamica no esperada',
        ctaLinks: [{ label: 'Ir', to: '/colabora' }],
        suggestions: ['como donar'],
      },
    );

    const response = await service.sendMessage({
      message: 'mensaje ambiguo',
      pageContext: 'home',
    });

    expect(response.replyType).toBe('FALLBACK');
    expect(response.answer).not.toBe('Respuesta dinamica no esperada');
  });

  it('recupera fallback con contexto dinamico cuando hay ancla de dominio', async () => {
    const superCandidate: ScoredCandidate = {
      ...baseCandidate,
      candidate: {
        ...baseCandidate.candidate,
        id: 9,
        intentCode: 'SUPERHEROES',
        questionCanonical: 'quienes son los superheroes puch',
      },
      score: 0.3,
      scoreBreakdown: {
        ...baseCandidate.scoreBreakdown,
        finalScore: 0.3,
      },
    };
    const { service, dynamicContextServiceMock } = createService(0.3, {
      scoredCandidate: superCandidate,
    });
    (dynamicContextServiceMock.buildIntentReply as jest.Mock).mockResolvedValue(
      {
        answer: 'SuperSlash: perfil dinamico',
        ctaLinks: [{ label: 'Ver SuperSlash', to: '/superheroes/superslash' }],
        suggestions: ['que superheroes hay'],
      },
    );

    const response = await service.sendMessage({
      message: 'dime algo sobre superslash',
      pageContext: 'home',
    });

    expect(response.replyType).toBe('DIRECT_ANSWER');
    expect(response.answer).toBe('SuperSlash: perfil dinamico');
    expect(response.ctaLinks[0]?.to).toContain('/superheroes/');
  });
});
