import { Injectable } from '@nestjs/common';
import type { Prisma } from 'generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { ChatbotCtaLink, KnowledgeCandidate } from './types/chatbot.types';

@Injectable()
export class KnowledgeBaseService {
  private cachedCandidates: KnowledgeCandidate[] | null = null;
  private cacheTimestamp = 0;
  private readonly cacheTtlMs = 30_000;

  constructor(private readonly prisma: PrismaService) {}

  async getCandidates(forceRefresh = false): Promise<KnowledgeCandidate[]> {
    const now = Date.now();

    if (
      !forceRefresh &&
      this.cachedCandidates &&
      now - this.cacheTimestamp < this.cacheTtlMs
    ) {
      return this.cachedCandidates;
    }

    const rows = await this.prisma.knowledgeItem.findMany({
      where: {
        isActive: true,
      },
      include: {
        intent: {
          select: {
            code: true,
            isActive: true,
            phrases: {
              where: {
                isActive: true,
              },
              select: {
                text: true,
              },
            },
          },
        },
      },
    });

    const candidates = rows
      .filter((row) => row.intent?.isActive !== false)
      .map((row) => ({
        id: row.id,
        intentCode: row.intent?.code ?? null,
        questionCanonical: row.questionCanonical,
        answer: row.answer,
        tags: this.parseStringArray(row.tags),
        route: row.route,
        ctaLinks: this.parseCtaLinks(row.ctaLinks),
        phrases: row.intent?.phrases.map((phrase) => phrase.text) ?? [],
      }));

    this.cachedCandidates = candidates;
    this.cacheTimestamp = now;

    return candidates;
  }

  invalidateCache() {
    this.cachedCandidates = null;
    this.cacheTimestamp = 0;
  }

  private parseStringArray(value: Prisma.JsonValue): string[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.filter((item): item is string => typeof item === 'string');
  }

  private parseCtaLinks(value: Prisma.JsonValue): ChatbotCtaLink[] {
    if (!Array.isArray(value)) {
      return [];
    }

    const links: ChatbotCtaLink[] = [];

    for (const rawItem of value) {
      if (
        typeof rawItem !== 'object' ||
        rawItem === null ||
        Array.isArray(rawItem)
      ) {
        continue;
      }

      const item = rawItem as Record<string, unknown>;

      links.push({
        label:
          typeof item.label === 'string' ? item.label : 'Ver más información',
        to: typeof item.to === 'string' ? item.to : '/',
      });
    }

    return links;
  }
}
