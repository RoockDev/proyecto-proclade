import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client-runtime-utils';
import { Prisma, ChatMessageRole, ChatReplyType } from 'generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ChatbotMatchingConfigService } from '../chatbot-matching-config.service';
import { ChatbotMetricsQueryDto } from './dto/chatbot-metrics-query.dto';
import { ListKnowledgeQueryDto } from './dto/list-knowledge-query.dto';
import { CreateKnowledgeItemDto } from './dto/create-knowledge-item.dto';
import { UpdateKnowledgeItemDto } from './dto/update-knowledge-item.dto';
import { ListUnresolvedQueryDto } from './dto/list-unresolved-query.dto';
import { CreateIntentDto } from './dto/create-intent.dto';
import { UpdateIntentDto } from './dto/update-intent.dto';
import { CreateIntentPhraseDto } from './dto/create-intent-phrase.dto';
import { UpdateIntentPhraseDto } from './dto/update-intent-phrase.dto';
import { UpdateChatbotConfigDto } from './dto/chatbot-config.dto';
import {
  ChatbotConfigSnapshot,
  ChatbotIntentItem,
  ChatbotIntentPhraseData,
  ChatbotKnowledgeListData,
  ChatbotMetricsData,
  ChatbotUnresolvedQuestionItem,
} from './types/chatbot-admin.types';
import {
  MatchingThresholds,
  MatchingWeights,
} from '../types/chatbot.types';

type DateRange = {
  start: Date;
  end: Date;
};

type KnowledgeItemWithIntent = Prisma.KnowledgeItemGetPayload<{
  include: {
    intent: {
      select: {
        code: true;
      };
    };
  };
}>;

type ChatbotIntentWithPhrases = Prisma.ChatbotIntentGetPayload<{
  include: {
    phrases: true;
  };
}>;

type ChatbotIntentPhrasePayload = Prisma.ChatbotIntentPhraseGetPayload<{}>;

type UnresolvedQuestionPayload = Prisma.UnresolvedQuestionGetPayload<{}>;

@Injectable()
export class ChatbotAdminService implements OnModuleInit {
  private readonly defaultWeights: MatchingWeights = {
    keyword: 0.2,
    fuzzy: 0.28,
    semantic: 0.42,
    context: 0.1,
  };

  private readonly defaultThresholds: MatchingThresholds = {
    directAnswer: 0.66,
    clarification: 0.45,
  };

  private readonly tolerance = 0.0001;

  constructor(
    private readonly prisma: PrismaService,
    private readonly chatbotMatchingConfigService: ChatbotMatchingConfigService,
  ) {}

  async onModuleInit() {
    const existing = await this.prisma.chatbotAdminConfig.findFirst({
      orderBy: { updatedAt: 'desc' },
    });

    if (existing) {
      this.chatbotMatchingConfigService.setRuntimeConfig({
        weights: this.extractWeights(existing.weights),
        thresholds: this.extractThresholds(existing.thresholds),
        fuzzyInternalMin: existing.fuzzyInternalMin,
      });
    }
  }

  async getMetrics(query: ChatbotMetricsQueryDto) {
    const { start, end } = this.parseDateRange(query);
    const timeframe = { createdAt: { gte: start, lte: end } };

    const totalMessages = await this.prisma.chatMessage.count({
      where: timeframe,
    });

    const botFilter: Prisma.ChatMessageWhereInput = {
      ...timeframe,
      role: ChatMessageRole.BOT,
    };

    const [directAnswerCount, clarificationCount, fallbackCount, botCount] =
      await Promise.all([
        this.prisma.chatMessage.count({
          where: { ...botFilter, replyType: ChatReplyType.DIRECT_ANSWER },
        }),
        this.prisma.chatMessage.count({
          where: { ...botFilter, replyType: ChatReplyType.CLARIFICATION },
        }),
        this.prisma.chatMessage.count({
          where: { ...botFilter, replyType: ChatReplyType.FALLBACK },
        }),
        this.prisma.chatMessage.count({
          where: { ...botFilter },
        }),
      ]);

    const { helpfulCount, totalFeedbackCount } = await this.fetchFeedbackStats(
      start,
      end,
    );

    const topIntents = await this.prisma.chatMessage.groupBy({
      by: ['detectedIntentCode'],
      where: {
        ...botFilter,
        detectedIntentCode: {
          not: null,
        },
      },
      _count: {
        detectedIntentCode: true,
      },
      orderBy: {
        _count: {
          detectedIntentCode: 'desc',
        },
      },
      take: 5,
    });

    const topUnresolved = await this.prisma.unresolvedQuestion.findMany({
      where: {
        lastSeenAt: { gte: start, lte: end },
        resolvedAt: null,
      },
      orderBy: {
        occurrences: 'desc',
      },
      take: 5,
    });

    const avgResponseTimeMs = await this.computeAverageSessionDuration(
      start,
      end,
    );

    const botTotal = botCount || 1;
    const metrics: ChatbotMetricsData = {
      totalMessages,
      directAnswerRate: directAnswerCount / botTotal,
      clarificationRate: clarificationCount / botTotal,
      fallbackRate: fallbackCount / botTotal,
      avgResponseTimeMs,
      topIntents: topIntents
        .filter((entry) => entry.detectedIntentCode)
        .map((entry) => ({
          code: entry.detectedIntentCode ?? 'unknown',
          count: entry._count.detectedIntentCode,
        })),
      topUnresolved: topUnresolved.map((row) => ({
        normalizedText: row.normalizedText,
        occurrences: row.occurrences,
      })),
      feedbackHelpfulnessRate:
        totalFeedbackCount > 0 ? helpfulCount / totalFeedbackCount : 0,
    };

    return {
      metrics,
    };
  }

  async listUnresolved(dto: ListUnresolvedQueryDto) {
    const where: Prisma.UnresolvedQuestionWhereInput = {};
    const resolvedRaw = (dto as unknown as { resolved?: unknown }).resolved;
    const resolved =
      resolvedRaw === true || resolvedRaw === 'true'
        ? true
        : resolvedRaw === false ||
            resolvedRaw === 'false'
          ? false
          : undefined;

    if (resolved === true) {
      where.resolvedAt = {
        not: null,
      };
    } else if (resolved === false) {
      // El panel lista pendientes cuando se solicita resolved=false.
      where.resolvedAt = null;
    }

    if (dto.minOccurrences) {
      where.occurrences = {
        gte: dto.minOccurrences,
      };
    }

    if (dto.search) {
      where.OR = [
        {
          normalizedText: {
            contains: dto.search,
            mode: 'insensitive',
          },
        },
        {
          sampleText: {
            contains: dto.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    const page = dto.page ?? 0;
    const pageSize = dto.pageSize ?? 15;

    const [items, total] = await Promise.all([
      this.prisma.unresolvedQuestion.findMany({
        where,
        orderBy: {
          occurrences: 'desc',
        },
        skip: page * pageSize,
        take: pageSize,
      }),
      this.prisma.unresolvedQuestion.count({
        where,
      }),
    ]);

    return {
      unresolved: {
        items: items.map(this.mapUnresolved),
        total,
      },
    };
  }

  async resolveUnresolved(id: number, resolvedById: number) {
    const question = await this.prisma.unresolvedQuestion.findUnique({
      where: { id },
    });

    if (!question) {
      throw new NotFoundException('No se encontró la pregunta no resuelta');
    }

    const updated = await this.prisma.unresolvedQuestion.update({
      where: { id },
      data: {
        resolvedAt: new Date(),
        resolvedById,
      },
    });

    return {
      unresolved: this.mapUnresolved(updated),
    };
  }

  async reopenUnresolved(id: number) {
    const question = await this.prisma.unresolvedQuestion.findUnique({
      where: { id },
    });

    if (!question) {
      throw new NotFoundException('No se encontrÃ³ la pregunta no resuelta');
    }

    const updated = await this.prisma.unresolvedQuestion.update({
      where: { id },
      data: {
        resolvedAt: null,
        resolvedById: null,
      },
    });

    return {
      unresolved: this.mapUnresolved(updated),
    };
  }

  async deleteUnresolved(id: number) {
    const question = await this.prisma.unresolvedQuestion.findUnique({
      where: { id },
    });

    if (!question) {
      throw new NotFoundException('No se encontro la pregunta no resuelta');
    }

    await this.prisma.unresolvedQuestion.delete({
      where: { id },
    });

    return {
      deleted: true,
      id,
    };
  }

  async listKnowledgeItems(dto: ListKnowledgeQueryDto) {
    const where: Prisma.KnowledgeItemWhereInput = {};

    if (dto.search) {
      where.OR = [
        {
          questionCanonical: {
            contains: dto.search,
            mode: 'insensitive',
          },
        },
        {
          answer: {
            contains: dto.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (dto.intentId) {
      where.intentId = dto.intentId;
    }

    if (dto.isActive !== undefined) {
      where.isActive = dto.isActive;
    }

    const page = dto.page ?? 0;
    const pageSize = dto.pageSize ?? 15;

    const [items, total] = await Promise.all([
      this.prisma.knowledgeItem.findMany({
        where,
        include: {
          intent: {
            select: {
              code: true,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
        skip: page * pageSize,
        take: pageSize,
      }),
      this.prisma.knowledgeItem.count({
        where,
      }),
    ]);

    return {
      knowledge: {
        items: items.map((item) => this.mapKnowledgeItem(item)),
        total,
      },
    };
  }

  async createKnowledgeItem(dto: CreateKnowledgeItemDto, userId: number) {
    const canonical = this.normalizeQuestionCanonical(dto.questionCanonical);
    const payload: Prisma.KnowledgeItemUncheckedCreateInput = {
      questionCanonical: canonical,
      answer: dto.answer,
      intentId: dto.intentId ?? null,
      route: dto.route ?? null,
      isActive: dto.isActive ?? true,
      updatedById: userId,
      tags: this.toInputJsonValue(dto.tags ?? []),
      ctaLinks: this.toInputJsonValue(dto.ctaLinks ?? []),
    };

    try {
      const knowledge = await this.prisma.knowledgeItem.create({
        data: payload,
        include: {
          intent: {
            select: {
              code: true,
            },
          },
        },
      });

      if (dto.unresolvedQuestionId) {
        await this.prisma.unresolvedQuestion.update({
          where: {
            id: dto.unresolvedQuestionId,
          },
          data: {
            resolvedAt: new Date(),
            resolvedById: userId,
          },
        });
      }

      return {
        knowledge: this.mapKnowledgeItem(knowledge),
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestException(
          'Ya existe un item de conocimiento con esa canonical.',
        );
      }

      throw error;
    }
  }

  async updateKnowledgeItem(
    id: number,
    dto: UpdateKnowledgeItemDto,
    userId: number,
  ) {
    const updatePayload: Prisma.KnowledgeItemUncheckedUpdateInput = {
      updatedById: userId,
    };

    if (dto.questionCanonical) {
      updatePayload.questionCanonical = this.normalizeQuestionCanonical(
        dto.questionCanonical,
      );
    }

    if (dto.answer !== undefined) {
      updatePayload.answer = dto.answer;
    }

    if (dto.intentId !== undefined) {
      updatePayload.intentId = dto.intentId;
    }

    if (dto.route !== undefined) {
      updatePayload.route = dto.route;
    }

    if (dto.isActive !== undefined) {
      updatePayload.isActive = dto.isActive;
    }

    if (dto.tags !== undefined) {
      updatePayload.tags = this.toInputJsonValue(dto.tags);
    }

    if (dto.ctaLinks !== undefined) {
      updatePayload.ctaLinks = this.toInputJsonValue(dto.ctaLinks);
    }

    try {
      const knowledge = await this.prisma.knowledgeItem.update({
        where: { id },
        data: updatePayload,
        include: {
          intent: {
            select: {
              code: true,
            },
          },
        },
      });

      return {
        knowledge: this.mapKnowledgeItem(knowledge),
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestException(
          'No se puede actualizar porque ya existe otro item con esa canonical.',
        );
      }

      throw error;
    }
  }

  async deleteKnowledgeItem(id: number) {
    try {
      await this.prisma.knowledgeItem.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('No se encontro el item de conocimiento');
      }

      throw error;
    }

    return {
      deleted: true,
      id,
    };
  }

  async listIntents() {
    const intents = await this.prisma.chatbotIntent.findMany({
      include: {
        phrases: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        priority: 'desc',
      },
    });

    return {
      intents: intents.map((intent) => this.mapIntent(intent)),
    };
  }

  async createIntent(dto: CreateIntentDto, userId: number) {
    const formattedCode = dto.code.trim().toUpperCase();

    try {
      const payload: Prisma.ChatbotIntentUncheckedCreateInput = {
        code: formattedCode,
        name: dto.name,
        description: dto.description ?? '',
        priority: dto.priority ?? 0,
        isActive: dto.isActive ?? true,
        updatedById: userId,
        phrases: dto.phrases
          ? {
              create: dto.phrases.map((phrase) => ({
                text: phrase.text,
                language: phrase.language,
                weight: phrase.weight,
                isActive: phrase.isActive,
                updatedById: userId,
              })),
            }
          : undefined,
      };

      const intent = await this.prisma.chatbotIntent.create({
        data: payload,
        include: {
          phrases: true,
        },
      });

      return {
        intent: this.mapIntent(intent),
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestException('Ya existe un intent con ese código.');
      }

      throw error;
    }
  }

  async updateIntent(id: number, dto: UpdateIntentDto, userId: number) {
    const updatePayload: Prisma.ChatbotIntentUncheckedUpdateInput = {
      updatedById: userId,
    };

    if (dto.name) {
      updatePayload.name = dto.name;
    }

    if (dto.description !== undefined) {
      updatePayload.description = dto.description ?? '';
    }

    if (dto.priority !== undefined) {
      updatePayload.priority = dto.priority;
    }

    if (dto.isActive !== undefined) {
      updatePayload.isActive = dto.isActive;
    }

    const intent = await this.prisma.chatbotIntent.update({
      where: { id },
      data: updatePayload,
      include: {
        phrases: true,
      },
    });

    return {
      intent: this.mapIntent(intent),
    };
  }

  async createIntentPhrase(
    intentId: number,
    dto: CreateIntentPhraseDto,
    userId: number,
  ) {
    const intent = await this.prisma.chatbotIntent.findUnique({
      where: { id: intentId },
    });

    if (!intent) {
      throw new NotFoundException('Intención no encontrada');
    }

    try {
      const payload: Prisma.ChatbotIntentPhraseUncheckedCreateInput = {
        intentId,
        text: dto.text,
        language: dto.language,
        weight: dto.weight,
        isActive: dto.isActive,
        updatedById: userId,
      };

      const phrase = await this.prisma.chatbotIntentPhrase.create({
        data: payload,
      });

      return {
        phrase: this.mapPhrase(phrase),
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestException(
          'Ya existe una frase idéntica para esta intención y lenguaje',
        );
      }

      throw error;
    }
  }

  async updateIntentPhrase(
    intentId: number,
    phraseId: number,
    dto: UpdateIntentPhraseDto,
    userId: number,
  ) {
    const phrase = await this.prisma.chatbotIntentPhrase.findFirst({
      where: {
        id: phraseId,
        intentId,
      },
    });

    if (!phrase) {
      throw new NotFoundException('Frase no encontrada para la intención');
    }

    try {
      const payload: Prisma.ChatbotIntentPhraseUncheckedUpdateInput = {
        text: dto.text,
        language: dto.language,
        weight: dto.weight,
        isActive: dto.isActive,
        updatedById: userId,
      };

      const updated = await this.prisma.chatbotIntentPhrase.update({
        where: {
          id: phraseId,
        },
        data: payload,
      });

      return {
        phrase: this.mapPhrase(updated),
      };
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestException(
          'Ya existe otra frase con los mismos datos para esta intención',
        );
      }

      throw error;
    }
  }

  async updateConfig(dto: UpdateChatbotConfigDto, userId: number) {
    const currentSnapshot = await this.getCurrentSnapshot();

    const nextWeights = dto.weights
      ? this.normalizeWeights(dto.weights)
      : currentSnapshot.weights;

    const nextThresholds = dto.thresholds
      ? this.ensureThresholds(dto.thresholds)
      : currentSnapshot.thresholds;

    const nextFuzzy =
      dto.fuzzyInternalMin ?? currentSnapshot.fuzzyInternalMin;

    const existing = await this.prisma.chatbotAdminConfig.findFirst({
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const weightsJson = this.toInputJsonValue(nextWeights);
    const thresholdsJson = this.toInputJsonValue(nextThresholds);

    const updatePayload: Prisma.ChatbotAdminConfigUncheckedUpdateInput = {
      weights: weightsJson,
      thresholds: thresholdsJson,
      fuzzyInternalMin: nextFuzzy,
      updatedById: userId,
    };

    const createPayload: Prisma.ChatbotAdminConfigUncheckedCreateInput = {
      weights: weightsJson,
      thresholds: thresholdsJson,
      fuzzyInternalMin: nextFuzzy,
      createdById: userId,
      updatedById: userId,
    };

    const record =
      existing !== null
        ? await this.prisma.chatbotAdminConfig.update({
            where: { id: existing.id },
            data: updatePayload,
          })
        : await this.prisma.chatbotAdminConfig.create({
            data: createPayload,
          });

    const snapshot: ChatbotConfigSnapshot = {
      weights: nextWeights,
      thresholds: nextThresholds,
      fuzzyInternalMin: nextFuzzy,
    };

    this.chatbotMatchingConfigService.setRuntimeConfig(snapshot);

    return { config: snapshot };
  }

  private mapUnresolved(item: UnresolvedQuestionPayload): ChatbotUnresolvedQuestionItem {
    return {
      id: item.id,
      normalizedText: item.normalizedText,
      sampleText: item.sampleText,
      pageContext: item.pageContext,
      occurrences: item.occurrences,
      firstSeenAt: item.firstSeenAt.toISOString(),
      lastSeenAt: item.lastSeenAt.toISOString(),
      resolvedAt: item.resolvedAt?.toISOString() ?? null,
      resolvedById: item.resolvedById ?? null,
    };
  }

  private mapKnowledgeItem(
    item: KnowledgeItemWithIntent,
  ): ChatbotKnowledgeListData['items'][number] {
    const tags = Array.isArray(item.tags)
      ? item.tags.filter((tag): tag is string => typeof tag === 'string')
      : [];
    const ctaLinks = Array.isArray(item.ctaLinks)
      ? item.ctaLinks
          .filter(
            (link): link is { label: string; to: string } =>
              typeof link === 'object' &&
              link !== null &&
              'label' in link &&
              'to' in link,
          )
          .map((link) => ({
            label: typeof link.label === 'string' ? link.label : 'Ver más',
            to: typeof link.to === 'string' ? link.to : '/',
          }))
      : [];

    return {
      id: item.id,
      intentId: item.intentId ?? null,
      intentCode: item.intent?.code ?? null,
      questionCanonical: item.questionCanonical,
      answer: item.answer,
      tags,
      route: item.route ?? null,
      ctaLinks,
      isActive: item.isActive,
      updatedAt: item.updatedAt.toISOString(),
      updatedById: item.updatedById ?? null,
    };
  }

  private mapIntent(intent: ChatbotIntentWithPhrases): ChatbotIntentItem {
    return {
      id: intent.id,
      code: intent.code,
      name: intent.name,
      description: intent.description,
      priority: intent.priority,
      isActive: intent.isActive,
      updatedAt: intent.updatedAt.toISOString(),
      updatedById: intent.updatedById ?? null,
      phrases: intent.phrases.map((phrase) => this.mapPhrase(phrase)),
    };
  }

  private mapPhrase(
    phrase: ChatbotIntentPhrasePayload,
  ): ChatbotIntentPhraseData {
    return {
      id: phrase.id,
      text: phrase.text,
      language: phrase.language,
      weight: phrase.weight,
      isActive: phrase.isActive,
      createdAt: phrase.createdAt.toISOString(),
      updatedAt: phrase.updatedAt.toISOString(),
      updatedById: phrase.updatedById ?? null,
    };
  }

  private parseDateRange(query: ChatbotMetricsQueryDto): DateRange {
    const end = query.endDate ? new Date(query.endDate) : new Date();
    const start = query.startDate
      ? new Date(query.startDate)
      : new Date(end.getTime() - 1000 * 60 * 60 * 24 * 7);

    return {
      start,
      end,
    };
  }

  private async computeAverageSessionDuration(
    start: Date,
    end: Date,
  ): Promise<number> {
    const sessions = await this.prisma.chatSession.findMany({
      where: {
        lastMessageAt: {
          gte: start,
          lte: end,
        },
      },
      select: {
        startedAt: true,
        lastMessageAt: true,
      },
    });

    const durations = sessions
      .map((session) => {
        if (!session.startedAt || !session.lastMessageAt) {
          return null;
        }

        return session.lastMessageAt.getTime() - session.startedAt.getTime();
      })
      .filter((value): value is number => typeof value === 'number' && value > 0);

    if (durations.length === 0) {
      return 0;
    }

    const total = durations.reduce((acc, value) => acc + value, 0);
    return Math.round(total / durations.length);
  }

  private async fetchFeedbackStats(start: Date, end: Date) {
    const [result] = await this.prisma.$queryRaw<
      Array<{ helpful: string | null; total: string | null }>
    >`
      SELECT
        COUNT(*) FILTER (WHERE (meta->'feedback'->>'helpful')::boolean = TRUE) AS "helpful",
        COUNT(*) FILTER (WHERE meta->'feedback'->>'helpful' IS NOT NULL) AS "total"
      FROM "ChatMessage"
      WHERE "role" = ${ChatMessageRole.BOT}
        AND "createdAt" >= ${start}
        AND "createdAt" <= ${end}
    `;

    const helpfulCount = result ? Number(result.helpful ?? 0) : 0;
    const total = result ? Number(result.total ?? 0) : 0;

    return {
      helpfulCount,
      totalFeedbackCount: total,
    };
  }

  private normalizeQuestionCanonical(value: string) {
    return value.trim().toLowerCase().replace(/\s+/g, ' ');
  }

  private async getCurrentSnapshot(): Promise<ChatbotConfigSnapshot> {
    const existing = await this.prisma.chatbotAdminConfig.findFirst({
      orderBy: {
        updatedAt: 'desc',
      },
    });

    if (existing) {
      return {
        weights: this.extractWeights(existing.weights),
        thresholds: this.extractThresholds(existing.thresholds),
        fuzzyInternalMin: existing.fuzzyInternalMin,
      };
    }

    return {
      weights: this.chatbotMatchingConfigService.getWeights(),
      thresholds: this.chatbotMatchingConfigService.getThresholds(),
      fuzzyInternalMin: this.chatbotMatchingConfigService.getFuzzyInternalMin(),
    };
  }

  private extractWeights(value: Prisma.JsonValue): MatchingWeights {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return this.defaultWeights;
    }

    const record = value as Record<string, unknown>;

    return {
      keyword: this.parseNumber(record.keyword, this.defaultWeights.keyword),
      fuzzy: this.parseNumber(record.fuzzy, this.defaultWeights.fuzzy),
      semantic: this.parseNumber(record.semantic, this.defaultWeights.semantic),
      context: this.parseNumber(record.context, this.defaultWeights.context),
    };
  }

  private extractThresholds(value: Prisma.JsonValue): MatchingThresholds {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return this.defaultThresholds;
    }

    const record = value as Record<string, unknown>;

    return {
      directAnswer: this.parseNumber(
        record.directAnswer,
        this.defaultThresholds.directAnswer,
      ),
      clarification: this.parseNumber(
        record.clarification,
        this.defaultThresholds.clarification,
      ),
    };
  }

  private parseNumber(
    value: unknown,
    fallback: number,
  ): number {
    if (typeof value === 'number' && !Number.isNaN(value)) {
      return value;
    }

    return fallback;
  }

  private normalizeWeights(weights: MatchingWeights): MatchingWeights {
    const sanitized: MatchingWeights = {
      keyword: this.clamp(weights.keyword),
      fuzzy: this.clamp(weights.fuzzy),
      semantic: this.clamp(weights.semantic),
      context: this.clamp(weights.context),
    };

    const total =
      sanitized.keyword +
      sanitized.fuzzy +
      sanitized.semantic +
      sanitized.context;

    if (total <= this.tolerance) {
      return this.defaultWeights;
    }

    return {
      keyword: sanitized.keyword / total,
      fuzzy: sanitized.fuzzy / total,
      semantic: sanitized.semantic / total,
      context: sanitized.context / total,
    };
  }

  private ensureThresholds(
    thresholds: MatchingThresholds,
  ): MatchingThresholds {
    const normalized: MatchingThresholds = {
      directAnswer: this.clamp(thresholds.directAnswer),
      clarification: this.clamp(thresholds.clarification),
    };

    if (normalized.directAnswer <= normalized.clarification) {
      throw new BadRequestException(
        'directAnswer debe ser mayor que clarification',
      );
    }

    return normalized;
  }

  private clamp(value: number) {
    if (Number.isNaN(value)) {
      return 0;
    }

    return Math.min(Math.max(value, 0), 1);
  }

  private toInputJsonValue(
    value: unknown,
  ): Prisma.JsonNullValueInput | Prisma.InputJsonValue {
    return value as Prisma.JsonNullValueInput | Prisma.InputJsonValue;
  }
}
