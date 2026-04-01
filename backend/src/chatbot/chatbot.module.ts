import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ChatbotController } from './chatbot.controller';
import { ChatbotOrchestratorService } from './chatbot-orchestrator.service';
import { ChatbotSessionService } from './chatbot-session.service';
import { KnowledgeBaseService } from './knowledge-base.service';
import { UnresolvedQuestionService } from './unresolved-question.service';

@Module({
  imports: [PrismaModule],
  controllers: [ChatbotController],
  providers: [
    ChatbotOrchestratorService,
    ChatbotSessionService,
    KnowledgeBaseService,
    UnresolvedQuestionService,
  ],
  exports: [ChatbotOrchestratorService],
})
export class ChatbotModule {}
