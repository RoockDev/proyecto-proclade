import { ChatbotMatchingConfigService } from './chatbot-matching-config.service';
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

  const createService = (score: number) => {
    const saveBotMessageMock = jest.fn().mockResolvedValue({ id: 321 });

    const sessionServiceMock: Partial<ChatbotSessionService> = {
      resolveOrCreateSession: jest.fn().mockResolvedValue(session),
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

    const scoring: ScoredCandidate = {
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
      getCandidates: jest.fn().mockResolvedValue([baseCandidate.candidate]),
    };

    const unresolvedServiceMock: Partial<UnresolvedQuestionService> = {
      register: jest.fn().mockResolvedValue(undefined),
    };

    const service = new ChatbotOrchestratorService(
      sessionServiceMock as ChatbotSessionService,
      configServiceMock as ChatbotMatchingConfigService,
      matchingEngineMock as ChatbotMatchingEngineService,
      knowledgeServiceMock as KnowledgeBaseService,
      unresolvedServiceMock as UnresolvedQuestionService,
    );

    return {
      service,
      sessionServiceMock,
      saveBotMessageMock,
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
    expect(unresolvedServiceMock.register).not.toHaveBeenCalled();
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
});
