import { ConfigService } from '@nestjs/config';
import { ChatbotMatchingConfigService } from './chatbot-matching-config.service';
import { ChatbotMatchingEngineService } from './chatbot-matching-engine.service';
import type { KnowledgeCandidate } from './types/chatbot.types';

describe('ChatbotMatchingEngineService', () => {
  const createEngine = (overrides?: Record<string, string>) => {
    const values: Record<string, string> = {
      CHATBOT_WEIGHT_KEYWORD: '0.35',
      CHATBOT_WEIGHT_FUZZY: '0.25',
      CHATBOT_WEIGHT_SEMANTIC: '0.30',
      CHATBOT_WEIGHT_CONTEXT: '0.10',
      CHATBOT_FUZZY_INTERNAL_MIN: '0.10',
      ...(overrides ?? {}),
    };

    const configServiceMock = {
      get: jest.fn((key: string) => values[key]),
    } as unknown as ConfigService;

    const config = new ChatbotMatchingConfigService(configServiceMock);

    return new ChatbotMatchingEngineService(config);
  };

  const candidates: KnowledgeCandidate[] = [
    {
      id: 1,
      intentCode: 'DONAR',
      questionCanonical: 'como donar en equipo puch',
      answer: 'Puedes donar desde la web oficial.',
      tags: ['donar', 'donacion', 'colabora'],
      route: '/colabora',
      ctaLinks: [{ label: 'Donar', to: 'https://example.org/donar' }],
      phrases: ['quiero donar', 'como hacer una donacion'],
    },
    {
      id: 2,
      intentCode: 'NOTICIAS',
      questionCanonical: 'ultimas noticias del proyecto',
      answer: 'Estas son las últimas noticias.',
      tags: ['noticias', 'actualidad'],
      route: '/noticias',
      ctaLinks: [{ label: 'Noticias', to: '/noticias' }],
      phrases: ['ver noticias', 'novedades del proyecto'],
    },
  ];

  it('calcula keywordScore alto para coincidencias directas de keywords', () => {
    const engine = createEngine();

    const scored = engine.scoreCandidates({
      normalizedMessage: 'como donar hoy',
      candidates,
      pageContext: 'colabora',
      sessionContext: {
        lastDetectedIntentCode: null,
        lastMessageAt: new Date(),
        startedAt: new Date(),
      },
    });

    const donar = scored.find((item) => item.candidate.intentCode === 'DONAR');
    const noticias = scored.find(
      (item) => item.candidate.intentCode === 'NOTICIAS',
    );

    expect(scored[0].candidate.intentCode).toBe('DONAR');
    expect((donar?.scoreBreakdown.keywordScore ?? 0) > 0.1).toBe(true);
    expect(
      (donar?.scoreBreakdown.keywordScore ?? 0) >
        (noticias?.scoreBreakdown.keywordScore ?? 0),
    ).toBe(true);
  });

  it('calcula fuzzyScore para typos y mantiene score util', () => {
    const engine = createEngine();

    const scored = engine.scoreCandidates({
      normalizedMessage: 'donaar',
      candidates,
      pageContext: 'colabora',
      sessionContext: {
        lastDetectedIntentCode: null,
        lastMessageAt: new Date(),
        startedAt: new Date(),
      },
    });

    const best = scored[0];
    expect(best.candidate.intentCode).toBe('DONAR');
    expect(best.scoreBreakdown.fuzzyScore).toBeGreaterThan(0.15);
  });

  it('calcula semanticScore con TF-IDF + cosine de forma estable', () => {
    const engine = createEngine();

    const scored = engine.scoreCandidates({
      normalizedMessage: 'ver noticias y novedades',
      candidates,
      pageContext: 'noticias',
      sessionContext: {
        lastDetectedIntentCode: null,
        lastMessageAt: new Date(),
        startedAt: new Date(),
      },
    });

    const noticias = scored.find(
      (item) => item.candidate.intentCode === 'NOTICIAS',
    );
    const donar = scored.find((item) => item.candidate.intentCode === 'DONAR');

    expect(noticias).toBeDefined();
    expect(donar).toBeDefined();
    expect((noticias?.scoreBreakdown.semanticScore ?? 0) > 0).toBe(true);
    expect(
      (noticias?.scoreBreakdown.semanticScore ?? 0) >
        (donar?.scoreBreakdown.semanticScore ?? 0),
    ).toBe(true);
  });

  it('calcula contextScore usando intent reciente y pageContext', () => {
    const engine = createEngine();

    const scored = engine.scoreCandidates({
      normalizedMessage: 'quiero seguir colaborando',
      candidates,
      pageContext: 'colabora',
      sessionContext: {
        lastDetectedIntentCode: 'DONAR',
        lastMessageAt: new Date(),
        startedAt: new Date(),
      },
    });

    const donar = scored.find((item) => item.candidate.intentCode === 'DONAR');
    const noticias = scored.find(
      (item) => item.candidate.intentCode === 'NOTICIAS',
    );

    expect((donar?.scoreBreakdown.contextScore ?? 0) > 0.5).toBe(true);
    expect(
      (donar?.scoreBreakdown.contextScore ?? 0) >
        (noticias?.scoreBreakdown.contextScore ?? 0),
    ).toBe(true);
  });
});
