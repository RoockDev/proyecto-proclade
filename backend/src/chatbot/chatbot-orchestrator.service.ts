import { Injectable } from '@nestjs/common';
import { ChatReplyType, type Prisma } from 'generated/prisma/client';
import { ChatbotMatchingConfigService } from './chatbot-matching-config.service';
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
    const bestMatch = scoredCandidates[0];
    const thresholds = this.chatbotMatchingConfigService.getThresholds();

    const reply = this.buildReply(
      session.sessionKey,
      bestMatch,
      scoredCandidates,
      thresholds,
    );

    if (reply.replyType === ChatReplyType.FALLBACK) {
      await this.unresolvedQuestionService.register({
        normalizedText,
        sampleText: payload.message,
        pageContext: payload.pageContext,
      });
    }

    const meta: Prisma.InputJsonValue = {
      pageContext: payload.pageContext ?? null,
      suggestions: reply.suggestions,
      ctaLinks: reply.ctaLinks,
      scoreBreakdown: bestMatch?.scoreBreakdown ?? null,
      candidateId: bestMatch?.candidate.id ?? null,
    };

    const botMessage = await this.chatbotSessionService.saveBotMessage(
      session.id,
      {
        messageText: reply.answer,
        detectedIntentCode: reply.detectedIntentCode,
        replyType: reply.replyType,
        confidence: reply.confidence,
        meta,
      },
    );

    await this.chatbotSessionService.touchSession(session.id);

    return {
      message: 'Respuesta del chatbot generada correctamente',
      messageId: botMessage.id,
      ...reply,
    };
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

  private buildReply(
    sessionId: string,
    bestMatch: ScoredCandidate | undefined,
    rankedCandidates: ScoredCandidate[],
    thresholds: MatchingThresholds,
  ): ChatbotReplyData {
    if (!bestMatch || bestMatch.score < thresholds.clarification) {
      return {
        sessionId,
        replyType: ChatReplyType.FALLBACK,
        answer:
          'Ahora mismo no tengo una respuesta exacta para eso. Si quieres, puedo ayudarte con información sobre donaciones, noticias, superhéroes o cómo colaborar.',
        confidence: 0,
        detectedIntentCode: null,
        suggestions: this.extractSuggestions(rankedCandidates),
        ctaLinks: [],
      };
    }

    if (bestMatch.score < thresholds.directAnswer) {
      return {
        sessionId,
        replyType: ChatReplyType.CLARIFICATION,
        answer:
          'Creo que estás preguntando sobre este tema. ¿Te sirve esta respuesta o quieres que te enseñe opciones relacionadas?',
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

    for (const item of ranked) {
      if (uniqueByText.has(item.text)) {
        continue;
      }

      uniqueByText.add(item.text);
      suggestions.push(item.text);

      if (suggestions.length >= input.limit) {
        break;
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
}
