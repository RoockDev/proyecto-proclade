import { Injectable } from '@nestjs/common';
import { ChatReplyType, type Prisma } from 'generated/prisma/client';
import { ChatbotSessionService } from './chatbot-session.service';
import { KnowledgeBaseService } from './knowledge-base.service';
import { UnresolvedQuestionService } from './unresolved-question.service';
import type {
  ChatbotReplyData,
  KnowledgeCandidate,
  ScoredCandidate,
} from './types/chatbot.types';

type SendMessagePayload = {
  message: string;
  sessionId?: string;
  pageContext?: string;
};

const DIRECT_ANSWER_THRESHOLD = 0.72;
const CLARIFICATION_THRESHOLD = 0.45;

@Injectable()
export class ChatbotOrchestratorService {
  constructor(
    private readonly chatbotSessionService: ChatbotSessionService,
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

    const candidates = await this.knowledgeBaseService.getCandidates();
    const scoredCandidates = this.rankCandidates(normalizedText, candidates);
    const bestMatch = scoredCandidates[0];

    const reply = this.buildReply(
      session.sessionKey,
      bestMatch,
      scoredCandidates,
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
    };

    await this.chatbotSessionService.saveBotMessage(session.id, {
      messageText: reply.answer,
      detectedIntentCode: reply.detectedIntentCode,
      replyType: reply.replyType,
      confidence: reply.confidence,
      meta,
    });

    await this.chatbotSessionService.touchSession(session.id);

    return {
      message: 'Respuesta del chatbot generada correctamente',
      ...reply,
    };
  }

  async getHealth() {
    const candidates = await this.knowledgeBaseService.getCandidates();

    return {
      message: 'Chatbot operativo',
      status: 'ok',
      totalKnowledgeItems: candidates.length,
      thresholds: {
        directAnswer: DIRECT_ANSWER_THRESHOLD,
        clarification: CLARIFICATION_THRESHOLD,
      },
    };
  }

  private buildReply(
    sessionId: string,
    bestMatch: ScoredCandidate | undefined,
    rankedCandidates: ScoredCandidate[],
  ): ChatbotReplyData {
    if (!bestMatch || bestMatch.score < CLARIFICATION_THRESHOLD) {
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

    if (bestMatch.score < DIRECT_ANSWER_THRESHOLD) {
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

  private rankCandidates(
    normalizedText: string,
    candidates: KnowledgeCandidate[],
  ): ScoredCandidate[] {
    const userTokens = this.tokenize(normalizedText);

    return candidates
      .map((candidate) => ({
        candidate,
        score: this.calculateCandidateScore(
          normalizedText,
          userTokens,
          candidate,
        ),
      }))
      .sort((left, right) => right.score - left.score)
      .slice(0, 5);
  }

  private calculateCandidateScore(
    normalizedText: string,
    userTokens: string[],
    candidate: KnowledgeCandidate,
  ) {
    const canonicalScore = this.calculateTextSimilarity(
      normalizedText,
      this.normalizeText(candidate.questionCanonical),
    );

    const phraseScore = candidate.phrases.reduce((best, phrase) => {
      const value = this.calculateTextSimilarity(
        normalizedText,
        this.normalizeText(phrase),
      );
      return value > best ? value : best;
    }, 0);

    const tagsText = candidate.tags.join(' ');
    const tagScore = this.calculateTextSimilarity(
      normalizedText,
      this.normalizeText(tagsText),
      userTokens,
    );

    return canonicalScore * 0.5 + phraseScore * 0.35 + tagScore * 0.15;
  }

  private calculateTextSimilarity(
    userText: string,
    candidateText: string,
    userTokensInput?: string[],
  ) {
    if (userText === candidateText) {
      return 1;
    }

    if (candidateText.includes(userText) || userText.includes(candidateText)) {
      return 0.92;
    }

    const userTokens = userTokensInput ?? this.tokenize(userText);
    const candidateTokens = this.tokenize(candidateText);

    if (userTokens.length === 0 || candidateTokens.length === 0) {
      return 0;
    }

    const candidateTokenSet = new Set(candidateTokens);
    const matchedTokens = userTokens.filter((token) =>
      candidateTokenSet.has(token),
    );

    return (
      matchedTokens.length / Math.max(userTokens.length, candidateTokens.length)
    );
  }

  private extractSuggestions(candidates: ScoredCandidate[]) {
    return candidates
      .filter((item) => item.score > 0.2)
      .slice(0, 3)
      .map((item) => item.candidate.questionCanonical);
  }

  private tokenize(text: string) {
    return text
      .split(' ')
      .map((token) => token.trim())
      .filter((token) => token.length > 1);
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
