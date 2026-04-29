import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type RegisterUnresolvedPayload = {
  normalizedText: string;
  sampleText: string;
  pageContext?: string;
};

@Injectable()
export class UnresolvedQuestionService {
  constructor(private readonly prisma: PrismaService) {}

  async register(payload: RegisterUnresolvedPayload) {
    return this.prisma.unresolvedQuestion.upsert({
      where: {
        normalizedText: payload.normalizedText,
      },
      update: {
        sampleText: payload.sampleText,
        pageContext: payload.pageContext ?? null,
        lastSeenAt: new Date(),
        occurrences: {
          increment: 1,
        },
        // Si una pregunta vuelve a aparecer, se reabre para revisión.
        resolvedAt: null,
        resolvedById: null,
      },
      create: {
        normalizedText: payload.normalizedText,
        sampleText: payload.sampleText,
        pageContext: payload.pageContext ?? null,
      },
    });
  }
}
