import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ChatMessageRole,
  ChatReplyType,
  type ChatMessage,
  type ChatSession,
  type Prisma,
} from 'generated/prisma/client';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import type { MatchingSessionContext } from './types/chatbot.types';

@Injectable()
export class ChatbotSessionService {
  constructor(private readonly prisma: PrismaService) {}

  async resolveOrCreateSession(sessionId?: string): Promise<ChatSession> {
    if (sessionId) {
      const existingSession = await this.prisma.chatSession.findFirst({
        where: {
          sessionKey: sessionId,
          isClosed: false,
        },
      });

      if (existingSession) {
        return existingSession;
      }
    }

    return this.prisma.chatSession.create({
      data: {
        sessionKey: randomUUID(),
      },
    });
  }

  async saveUserMessage(
    sessionId: number,
    messageText: string,
    normalizedText: string,
  ) {
    return this.prisma.chatMessage.create({
      data: {
        sessionId,
        role: ChatMessageRole.USER,
        messageText,
        normalizedText,
      },
    });
  }

  async saveBotMessage(
    sessionId: number,
    payload: {
      messageText: string;
      detectedIntentCode: string | null;
      replyType: ChatReplyType;
      confidence: number;
      meta?: Prisma.InputJsonValue;
    },
  ) {
    return this.prisma.chatMessage.create({
      data: {
        sessionId,
        role: ChatMessageRole.BOT,
        messageText: payload.messageText,
        detectedIntentCode: payload.detectedIntentCode,
        replyType: payload.replyType,
        confidence: payload.confidence,
        meta: payload.meta,
      },
    });
  }

  async touchSession(sessionId: number) {
    return this.prisma.chatSession.update({
      where: { id: sessionId },
      data: { lastMessageAt: new Date() },
    });
  }

  async getSessionContext(sessionId: number): Promise<MatchingSessionContext> {
    const [session, lastDetectedIntentMessage] = await Promise.all([
      this.prisma.chatSession.findUnique({
        where: { id: sessionId },
        select: {
          startedAt: true,
          lastMessageAt: true,
        },
      }),
      this.prisma.chatMessage.findFirst({
        where: {
          sessionId,
          role: ChatMessageRole.BOT,
          detectedIntentCode: {
            not: null,
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          detectedIntentCode: true,
        },
      }),
    ]);

    return {
      lastDetectedIntentCode:
        lastDetectedIntentMessage?.detectedIntentCode ?? null,
      lastMessageAt: session?.lastMessageAt ?? null,
      startedAt: session?.startedAt ?? null,
    };
  }

  async findOpenSessionByKey(sessionKey: string): Promise<ChatSession | null> {
    return this.prisma.chatSession.findFirst({
      where: {
        sessionKey,
        isClosed: false,
      },
    });
  }

  async getLastDetectedIntentCode(sessionId: number): Promise<string | null> {
    const message = await this.prisma.chatMessage.findFirst({
      where: {
        sessionId,
        role: ChatMessageRole.BOT,
        detectedIntentCode: {
          not: null,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        detectedIntentCode: true,
      },
    });

    return message?.detectedIntentCode ?? null;
  }

  async registerFeedback(payload: {
    sessionId: string;
    messageId: number;
    helpful: boolean;
  }): Promise<ChatMessage> {
    const session = await this.findOpenSessionByKey(payload.sessionId);

    if (!session) {
      throw new NotFoundException(
        'No existe una sesión activa con ese sessionId',
      );
    }

    const message = await this.prisma.chatMessage.findFirst({
      where: {
        id: payload.messageId,
        sessionId: session.id,
      },
    });

    if (!message) {
      throw new NotFoundException(
        'No existe un mensaje con ese messageId en la sesión indicada',
      );
    }

    if (message.role !== ChatMessageRole.BOT) {
      throw new BadRequestException(
        'Solo se puede registrar feedback sobre mensajes del asistente',
      );
    }

    const baseMeta = this.extractMetaObject(message.meta);
    const nextMeta: Prisma.InputJsonValue = {
      ...baseMeta,
      feedback: {
        helpful: payload.helpful,
        providedAt: new Date().toISOString(),
      },
    };

    return this.prisma.chatMessage.update({
      where: {
        id: message.id,
      },
      data: {
        meta: nextMeta,
      },
    });
  }

  private extractMetaObject(
    value: Prisma.JsonValue | null,
  ): Record<string, unknown> {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return {};
    }

    return value as Record<string, unknown>;
  }
}
