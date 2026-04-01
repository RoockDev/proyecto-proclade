import { Injectable } from '@nestjs/common';
import {
  ChatMessageRole,
  ChatReplyType,
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
}
