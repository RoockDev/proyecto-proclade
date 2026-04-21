import { Injectable } from '@nestjs/common';
import { ChatReplyType, type Prisma } from 'generated/prisma/client';
import { ChatbotMatchingConfigService } from './chatbot-matching-config.service';
import { ChatbotDynamicContextService } from './chatbot-dynamic-context.service';
import { ChatbotMatchingEngineService } from './chatbot-matching-engine.service';
import { ChatbotSessionService } from './chatbot-session.service';
import { KnowledgeBaseService } from './knowledge-base.service';
import { UnresolvedQuestionService } from './unresolved-question.service';
import type {
  ChatbotReplyData,
  ChatbotSuggestionsData,
  MatchingThresholds,
  ScoredCandidate,
} from './types/chatbot.types';

type SendMessagePayload = {
  message: string;
  sessionId?: string;
  pageContext?: string;
};

@Injectable()
export class ChatbotOrchestratorService {
  constructor(
    private readonly chatbotSessionService: ChatbotSessionService,
    private readonly chatbotMatchingConfigService: ChatbotMatchingConfigService,
    private readonly chatbotMatchingEngineService: ChatbotMatchingEngineService,
    private readonly chatbotDynamicContextService: ChatbotDynamicContextService,
    private readonly knowledgeBaseService: KnowledgeBaseService,
    private readonly unresolvedQuestionService: UnresolvedQuestionService,
  ) {}

  async createOrReuseSession(sessionId?: string) {
    const session =
      await this.chatbotSessionService.resolveOrCreateSession(sessionId);

    return {
      message: 'Sesión del chatbot preparada correctamente',
      sessionId: session.sessionKey,
    };
  }

  async sendMessage(payload: SendMessagePayload) {
    const normalizedText = this.normalizeText(payload.message);
    const session = await this.chatbotSessionService.resolveOrCreateSession(
      payload.sessionId,
    );

    await this.chatbotSessionService.saveUserMessage(
      session.id,
      payload.message,
      normalizedText,
    );

    const conversationalReply = this.buildConversationalReply(
      session.sessionKey,
      normalizedText,
    );

    if (conversationalReply) {
      const enrichedConversationalReply =
        await this.enrichReplyWithDynamicContext(
          conversationalReply,
          normalizedText,
        );
      const safeConversationalReply = this.applySafetyGuard(
        session.sessionKey,
        enrichedConversationalReply,
      );
      return this.persistReply({
        sessionId: session.id,
        pageContext: payload.pageContext,
        reply: safeConversationalReply,
        scoreBreakdown: null,
        candidateId: null,
        normalizedText,
        sampleText: payload.message,
      });
    }

    if (this.isLikelyOutOfDomain(normalizedText)) {
      return this.persistReply({
        sessionId: session.id,
        pageContext: payload.pageContext,
        reply: this.buildOutOfDomainReply(session.sessionKey),
        scoreBreakdown: null,
        candidateId: null,
        normalizedText,
        sampleText: payload.message,
      });
    }

    const sessionContext = await this.chatbotSessionService.getSessionContext(
      session.id,
    );
    const candidates = await this.knowledgeBaseService.getCandidates();
    const scoredCandidates = this.chatbotMatchingEngineService.scoreCandidates({
      normalizedMessage: normalizedText,
      candidates,
      pageContext: payload.pageContext,
      sessionContext,
    });
    const rerankedCandidates = this.applyIntentHints(
      normalizedText,
      scoredCandidates,
    );
    const bestMatch = rerankedCandidates[0];
    const thresholds = this.chatbotMatchingConfigService.getThresholds();

    const reply = this.buildReply(
      session.sessionKey,
      bestMatch,
      rerankedCandidates,
      thresholds,
    );
    const enrichedReply = await this.enrichReplyWithDynamicContext(
      reply,
      normalizedText,
    );
    const safeReply = this.applySafetyGuard(session.sessionKey, enrichedReply);

    return this.persistReply({
      sessionId: session.id,
      pageContext: payload.pageContext,
      reply: safeReply,
      scoreBreakdown: bestMatch?.scoreBreakdown ?? null,
      candidateId: bestMatch?.candidate.id ?? null,
      normalizedText,
      sampleText: payload.message,
    });
  }

  async getHealth() {
    const candidates = await this.knowledgeBaseService.getCandidates();
    const configSnapshot =
      this.chatbotMatchingEngineService.getConfigSnapshot();

    return {
      message: 'Chatbot operativo',
      status: 'ok',
      totalKnowledgeItems: candidates.length,
      thresholds: configSnapshot.thresholds,
      weights: configSnapshot.weights,
    };
  }

  async getSuggestions(payload: {
    sessionId?: string;
    pageContext?: string;
    limit?: number;
  }) {
    const safeLimit = Math.max(1, Math.min(payload.limit ?? 4, 8));
    const session = payload.sessionId
      ? await this.chatbotSessionService.findOpenSessionByKey(payload.sessionId)
      : null;

    const lastDetectedIntentCode = session
      ? await this.chatbotSessionService.getLastDetectedIntentCode(session.id)
      : null;

    const candidates = await this.knowledgeBaseService.getCandidates();
    const uniqueSuggestions = this.buildSuggestions({
      candidates,
      limit: safeLimit,
      pageContext: payload.pageContext,
      lastDetectedIntentCode,
    });

    const data: ChatbotSuggestionsData = {
      sessionId: session?.sessionKey ?? payload.sessionId ?? null,
      pageContext: payload.pageContext ?? null,
      suggestions: uniqueSuggestions,
    };

    return {
      message: 'Sugerencias del chatbot obtenidas correctamente',
      ...data,
    };
  }

  async registerFeedback(payload: {
    sessionId: string;
    messageId: number;
    helpful: boolean;
  }) {
    await this.chatbotSessionService.registerFeedback(payload);

    return {
      message: 'Feedback del chatbot registrado correctamente',
      sessionId: payload.sessionId,
      messageId: payload.messageId,
      helpful: payload.helpful,
    };
  }

  private async persistReply(input: {
    sessionId: number;
    pageContext?: string;
    reply: ChatbotReplyData;
    scoreBreakdown: Prisma.InputJsonValue | null;
    candidateId: number | null;
    normalizedText: string;
    sampleText: string;
  }) {
    if (input.reply.replyType === ChatReplyType.FALLBACK) {
      await this.unresolvedQuestionService.register({
        normalizedText: input.normalizedText,
        sampleText: input.sampleText,
        pageContext: input.pageContext,
      });
    }

    const meta: Prisma.InputJsonValue = {
      pageContext: input.pageContext ?? null,
      suggestions: input.reply.suggestions,
      ctaLinks: input.reply.ctaLinks,
      scoreBreakdown: input.scoreBreakdown,
      candidateId: input.candidateId,
    };

    const botMessage = await this.chatbotSessionService.saveBotMessage(
      input.sessionId,
      {
        messageText: input.reply.answer,
        detectedIntentCode: input.reply.detectedIntentCode,
        replyType: input.reply.replyType,
        confidence: input.reply.confidence,
        meta,
      },
    );

    await this.chatbotSessionService.touchSession(input.sessionId);

    return {
      message: 'Respuesta del chatbot generada correctamente',
      messageId: botMessage.id,
      ...input.reply,
    };
  }

  private applySafetyGuard(sessionId: string, reply: ChatbotReplyData) {
    if (!this.hasUnsafeContent(reply.answer)) {
      return reply;
    }

    return {
      sessionId,
      replyType: ChatReplyType.FALLBACK,
      answer:
        'No puedo responder con ese contenido. Si quieres, te ayudo con informacion de Equipo PUCH: donaciones, colaboracion, noticias, delegaciones y contacto.',
      confidence: 0,
      detectedIntentCode: null,
      suggestions: [
        'como donar',
        'como colaborar sin donar',
        'donde ver noticias del proyecto',
      ],
      ctaLinks: [],
    };
  }

  private buildOutOfDomainReply(sessionId: string): ChatbotReplyData {
    return {
      sessionId,
      replyType: ChatReplyType.FALLBACK,
      answer:
        'No puedo ayudarte con ese tema, pero si con Equipo PUCH y Fundacion PROCLADE. Puedo ayudarte con donaciones, colaboracion, noticias, superheroes, retos, delegaciones y contacto.',
      confidence: 0,
      detectedIntentCode: null,
      suggestions: [
        'que es equipo puch',
        'como donar',
        'como colaborar sin donar',
      ],
      ctaLinks: [],
    };
  }

  private isLikelyOutOfDomain(normalizedText: string) {
    if (this.hasDomainAnchorKeyword(normalizedText)) {
      return false;
    }

    return /\b(barsa|barca|realmadrid|madrid cf|atleti|champions|laliga|futbol|partido|gol|goles|penalti|arbitro|nba|nfl|bitcoin|btc|ethereum|crypto|criptomoneda|trump|biden|elecciones|senado|presidente|temperatura|clima|tiempo|llover|lluvia)\b/.test(
      normalizedText,
    );
  }

  private hasUnsafeContent(text: string) {
    return /\b(matar|maten|muerte|odio|racista|puta|puto|gilipollas|subnormal|maricon|nazi)\b/.test(
      text,
    );
  }

  private buildReply(
    sessionId: string,
    bestMatch: ScoredCandidate | undefined,
    rankedCandidates: ScoredCandidate[],
    thresholds: MatchingThresholds,
  ): ChatbotReplyData {
    const bestQuestion = bestMatch?.candidate.questionCanonical;

    if (!bestMatch || bestMatch.score < thresholds.clarification) {
      const fallbackAnswer = bestQuestion
        ? `No te entendi del todo. Te refieres a "${bestQuestion}"? Si quieres, tambien puedo ayudarte con donaciones, noticias, superheroes o como colaborar.`
        : 'No he entendido bien tu mensaje. Reformulalo y te ayudo con donaciones, noticias, superheroes, delegaciones o colaboracion.';

      return {
        sessionId,
        replyType: ChatReplyType.FALLBACK,
        answer: fallbackAnswer,
        confidence: 0,
        detectedIntentCode: bestMatch?.candidate.intentCode ?? null,
        suggestions: this.extractSuggestions(rankedCandidates),
        ctaLinks: bestMatch?.candidate.ctaLinks ?? [],
      };
    }

    const shouldDirectAnswer =
      bestMatch.score >= thresholds.directAnswer ||
      (bestMatch.scoreBreakdown.fuzzyScore >= 0.95 &&
        bestMatch.scoreBreakdown.semanticScore >= 0.55);

    if (!shouldDirectAnswer) {
      return {
        sessionId,
        replyType: ChatReplyType.CLARIFICATION,
        answer: `${bestMatch.candidate.answer}\n\nSi no era exactamente esto, dime más detalle y te doy una respuesta más afinada.`,
        confidence: bestMatch.score,
        detectedIntentCode: bestMatch.candidate.intentCode,
        suggestions: this.extractSuggestions(rankedCandidates),
        ctaLinks: bestMatch.candidate.ctaLinks,
      };
    }

    return {
      sessionId,
      replyType: ChatReplyType.DIRECT_ANSWER,
      answer: bestMatch.candidate.answer,
      confidence: bestMatch.score,
      detectedIntentCode: bestMatch.candidate.intentCode,
      suggestions: this.extractSuggestions(rankedCandidates),
      ctaLinks: bestMatch.candidate.ctaLinks,
    };
  }

  private extractSuggestions(candidates: ScoredCandidate[]) {
    return candidates
      .filter((item) => item.score > 0.2)
      .slice(0, 3)
      .map((item) => item.candidate.questionCanonical);
  }

  private buildSuggestions(input: {
    candidates: ScoredCandidate['candidate'][];
    pageContext?: string;
    lastDetectedIntentCode: string | null;
    limit: number;
  }) {
    const onboardingSuggestions = this.buildOnboardingSuggestions(
      input.candidates,
      input.limit,
    );

    const ranked = input.candidates
      .map((candidate) => {
        let score = 0;

        if (
          input.lastDetectedIntentCode &&
          candidate.intentCode === input.lastDetectedIntentCode
        ) {
          score += 2;
        }

        if (this.pageContextMatchesRoute(input.pageContext, candidate.route)) {
          score += 1;
        }

        if (candidate.ctaLinks.length > 0) {
          score += 0.2;
        }

        return {
          text: candidate.questionCanonical,
          score,
        };
      })
      .sort((left, right) => right.score - left.score);

    const uniqueByText = new Set<string>();
    const suggestions: string[] = [];

    if (!input.lastDetectedIntentCode) {
      for (const suggestion of onboardingSuggestions) {
        uniqueByText.add(suggestion);
        suggestions.push(suggestion);
      }
    }

    for (const item of ranked) {
      const hasCapacity = suggestions.length < input.limit;
      const isUnique = !uniqueByText.has(item.text);

      if (hasCapacity && isUnique) {
        uniqueByText.add(item.text);
        suggestions.push(item.text);
      }
    }

    return suggestions;
  }

  private buildOnboardingSuggestions(
    candidates: ScoredCandidate['candidate'][],
    limit: number,
  ) {
    const preferredSuggestions = [
      {
        canonical: 'como donar',
        label: '¿Cómo puedo donar?',
      },
      {
        canonical: 'quiero solicitar informacion',
        label: 'Quiero solicitar información',
      },
      {
        canonical: 'como colaborar sin donar',
        label: '¿Cómo puedo colaborar sin donar?',
      },
      {
        canonical: 'formulario de colaboracion',
        label: 'Quiero colaborar (formulario)',
      },
      {
        canonical: 'donde ver noticias del proyecto',
        label: 'Enséñame las últimas noticias',
      },
    ];
    const availableSuggestions = new Set(
      candidates.map((candidate) => candidate.questionCanonical),
    );
    const suggestions: string[] = [];

    for (const suggestion of preferredSuggestions) {
      const hasCapacity = suggestions.length < limit;
      const isAvailable = availableSuggestions.has(suggestion.canonical);

      if (hasCapacity && isAvailable) {
        suggestions.push(suggestion.label);
      }
    }

    return suggestions;
  }

  private pageContextMatchesRoute(
    pageContext: string | undefined,
    route: string | null,
  ) {
    if (!pageContext || !route) {
      return false;
    }

    const normalizedPage = `/${pageContext.replace(/^\/+/, '').trim()}`;
    const normalizedRoute = `/${route.replace(/^\/+/, '').trim()}`;

    return (
      normalizedPage === normalizedRoute ||
      normalizedPage.startsWith(normalizedRoute) ||
      normalizedRoute.startsWith(normalizedPage)
    );
  }

  private normalizeText(text: string) {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 ]+/g, ' ')
      .replace(/\s+/g, ' ');
  }

  private applyIntentHints(
    normalizedText: string,
    candidates: ScoredCandidate[],
  ) {
    const preferredIntentCode = this.detectPreferredIntentCode(normalizedText);

    if (!preferredIntentCode) {
      return candidates;
    }

    return candidates
      .map((candidate) => {
        if (candidate.candidate.intentCode !== preferredIntentCode) {
          return candidate;
        }

        return {
          ...candidate,
          score: Math.min(1, candidate.score + 0.18),
        };
      })
      .sort((left, right) => right.score - left.score);
  }

  private detectPreferredIntentCode(normalizedText: string) {
    if (/\bnotici\w*\b/.test(normalizedText)) {
      return 'NOTICIAS';
    }

    if (
      /\bdeleg\w*\b/.test(normalizedText) ||
      /\bciudad real\b|\bmadrid\b/.test(normalizedText)
    ) {
      return 'DELEGACIONES';
    }

    if (
      /\bsuperh\w*\b|\bsuper errores\b|\bsuper heroes\b|\bsuper\w{4,}\b/.test(
        normalizedText,
      )
    ) {
      return 'SUPERHEROES';
    }

    if (/\breto\w*\b/.test(normalizedText)) {
      return 'RETOS_SOLIDARIOS';
    }

    return null;
  }

  private async enrichReplyWithDynamicContext(
    reply: ChatbotReplyData,
    normalizedText: string,
  ) {
    if (!reply.detectedIntentCode) {
      return reply;
    }

    const hasDomainAnchor = this.hasDomainAnchorKeyword(normalizedText);
    const hasEnoughConfidence = reply.confidence >= 0.45;
    const canRecoverFallbackWithContext =
      reply.replyType === ChatReplyType.FALLBACK &&
      hasDomainAnchor &&
      !this.isNonsense(normalizedText) &&
      this.isDynamicFallbackIntent(reply.detectedIntentCode);

    if (
      reply.replyType !== ChatReplyType.FALLBACK &&
      !hasDomainAnchor &&
      !hasEnoughConfidence
    ) {
      return reply;
    }

    if (reply.replyType === ChatReplyType.FALLBACK && !canRecoverFallbackWithContext) {
      return reply;
    }

    const dynamicReply =
      await this.chatbotDynamicContextService.buildIntentReply(
        reply.detectedIntentCode,
        normalizedText,
      );

    if (!dynamicReply) {
      return reply;
    }

    const mergedSuggestions = Array.from(
      new Set([...dynamicReply.suggestions, ...reply.suggestions]),
    ).slice(0, 5);

    return {
      ...reply,
      replyType: ChatReplyType.DIRECT_ANSWER,
      answer: dynamicReply.answer,
      ctaLinks:
        dynamicReply.ctaLinks.length > 0
          ? dynamicReply.ctaLinks
          : reply.ctaLinks,
      suggestions: mergedSuggestions,
    };
  }

  private isDynamicFallbackIntent(intentCode: string | null) {
    if (!intentCode) {
      return false;
    }

    return [
      'SUPERHEROES',
      'DELEGACIONES',
      'RETOS_SOLIDARIOS',
      'NOTICIAS',
      'COLABORAR',
      'DONAR',
      'BIBLIOTECAS_HUMANAS',
      'CONTACTO',
    ].includes(intentCode);
  }

  private buildConversationalReply(
    sessionId: string,
    normalizedText: string,
  ): ChatbotReplyData | null {
    if (this.isGreeting(normalizedText)) {
      return {
        sessionId,
        replyType: ChatReplyType.DIRECT_ANSWER,
        answer:
          'Hola, soy el asistente de Equipo PUCH. Puedo ayudarte con donaciones, noticias, superhéroes, colaboración y datos del proyecto. ¿Qué necesitas?',
        confidence: 1,
        detectedIntentCode: null,
        suggestions: [
          'como donar',
          'donde ver noticias del proyecto',
          'que es equipo puch',
        ],
        ctaLinks: [],
      };
    }

    if (this.isSmallTalk(normalizedText)) {
      return {
        sessionId,
        replyType: ChatReplyType.DIRECT_ANSWER,
        answer:
          'Estoy genial y listo para ayudarte. Si quieres, te cuento cómo donar, colaborar, ver noticias o conocer los superhéroes del proyecto.',
        confidence: 1,
        detectedIntentCode: null,
        suggestions: [
          'como donar',
          'como colaborar sin donar',
          'quienes son los superheroes puch',
        ],
        ctaLinks: [],
      };
    }

    if (this.isThanks(normalizedText)) {
      return {
        sessionId,
        replyType: ChatReplyType.DIRECT_ANSWER,
        answer:
          'De nada. Si quieres, puedo seguir ayudándote con donaciones, noticias o información del proyecto.',
        confidence: 1,
        detectedIntentCode: null,
        suggestions: [
          'como colaborar sin donar',
          'que tipo de noticias publican',
          'quienes son los superheroes puch',
        ],
        ctaLinks: [],
      };
    }

    if (this.isSupportRequest(normalizedText)) {
      return {
        sessionId,
        replyType: ChatReplyType.DIRECT_ANSWER,
        answer:
          'Claro. Si quieres solicitar información o colaborar, puedo orientarte ahora mismo: puedes donar desde la página oficial de PROCLADE o escribirnos para colaboración y voluntariado.',
        confidence: 1,
        detectedIntentCode: 'CONTACTO',
        suggestions: [
          'como donar',
          'como colaborar sin donar',
          'formulario de colaboracion',
        ],
        ctaLinks: [
          {
            label: 'Ir a donar en PROCLADE',
            to: 'https://www.fundacionproclade.org/dona/',
          },
          {
            label: 'Escribir a equipo@equipopuch.org',
            to: 'mailto:equipo@equipopuch.org',
          },
        ],
      };
    }

    if (this.isNonsense(normalizedText)) {
      return {
        sessionId,
        replyType: ChatReplyType.FALLBACK,
        answer:
          'No he conseguido entender tu mensaje. Prueba con una frase como: "cómo donar", "últimas noticias" o "superhéroes".',
        confidence: 0,
        detectedIntentCode: null,
        suggestions: [
          'como donar',
          'donde ver noticias del proyecto',
          'quienes son los superheroes puch',
        ],
        ctaLinks: [],
      };
    }

    if (this.isGoodbye(normalizedText)) {
      return {
        sessionId,
        replyType: ChatReplyType.DIRECT_ANSWER,
        answer:
          'Perfecto, aquí estaré cuando lo necesites. ¡Gracias por apoyar a Equipo PUCH!',
        confidence: 1,
        detectedIntentCode: null,
        suggestions: [],
        ctaLinks: [],
      };
    }

    return null;
  }

  private isGreeting(normalizedText: string) {
    return /^(hola+|buenas+|buenos dias|buen dia|buenas tardes|buenas noches|hey+|ey+|eyy+)( .*)?$/.test(
      normalizedText,
    );
  }

  private isSmallTalk(normalizedText: string) {
    return /^(que tal|como estas|como va todo|todo bien|como te va|que tal estas)( .*)?$/.test(
      normalizedText,
    );
  }

  private isThanks(normalizedText: string) {
    return /^(gracias+|muchas gracias|mil gracias|genial gracias|perfecto gracias)( .*)?$/.test(
      normalizedText,
    );
  }

  private isGoodbye(normalizedText: string) {
    return /^(adios+|hasta luego|nos vemos|chao+|hasta pronto|hasta manana|me voy|bye+)( .*)?$/.test(
      normalizedText,
    );
  }

  private isNonsense(normalizedText: string) {
    if (!normalizedText || normalizedText.length < 6) {
      return false;
    }

    if (this.hasDomainAnchorKeyword(normalizedText)) {
      return false;
    }

    const tokens = normalizedText.split(' ').filter(Boolean);
    if (tokens.length === 1) {
      const token = tokens[0];

      if (token.length < 7) {
        return false;
      }

      return this.isLikelyGibberishToken(token);
    }

    const relevantTokens = tokens.filter((token) => token.length >= 4);
    if (relevantTokens.length < 2) {
      return false;
    }

    return relevantTokens.every((token) => this.isLikelyGibberishToken(token));
  }

  private isSupportRequest(normalizedText: string) {
    const isDomainSpecificQuery =
      /(notici\w*|reto\w*|superh\w*|super\w{4,}|deleg\w*|equipo puch|biblioteca|libro humano|ciudad real|madrid)/.test(
        normalizedText,
      );

    if (isDomainSpecificQuery) {
      return false;
    }

    return /^(quiero|me puedes|podrias|necesito).*(solicitar|informacion|ayuda|colaborar|voluntariado|contacto)( .*)?$/.test(
      normalizedText,
    );
  }

  private hasDomainAnchorKeyword(normalizedText: string) {
    return /(hola|buenas|gracias|adios|notici\w*|reto\w*|superh\w*|super\w{4,}|deleg\w*|donar|donacion|colaborar|voluntariado|contacto|equipo puch|biblioteca|libro humano|como donar|que es equipo puch|ciudad real|madrid)/.test(
      normalizedText,
    );
  }

  private isLikelyGibberishToken(token: string) {
    const uniqueCharsRatio = new Set(token).size / token.length;
    const hasLongConsonantRun = /[bcdfghjklmnñpqrstvwxyz]{6,}/.test(token);
    const hasRepeatedChunk = /^([a-z]{2,4})\1{2,}$/.test(token);
    const noVowels = !/[aeiou]/.test(token);

    return (
      uniqueCharsRatio < 0.35 ||
      hasLongConsonantRun ||
      hasRepeatedChunk ||
      noVowels
    );
  }
}
