import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ChatbotMatchingConfigService } from './chatbot-matching-config.service';
import { ChatbotDynamicContextService } from './chatbot-dynamic-context.service';
import { ChatbotMatchingEngineService } from './chatbot-matching-engine.service';
import { ChatbotController } from './chatbot.controller';
import { ChatbotOrchestratorService } from './chatbot-orchestrator.service';
import { ChatbotSessionService } from './chatbot-session.service';
import { KnowledgeBaseService } from './knowledge-base.service';
import { UnresolvedQuestionService } from './unresolved-question.service';

@Module({
  imports: [PrismaModule],
  controllers: [ChatbotController],
  providers: [
    ChatbotMatchingConfigService,
    ChatbotDynamicContextService,
    ChatbotMatchingEngineService,
    ChatbotOrchestratorService,
    ChatbotSessionService,
    KnowledgeBaseService,
    UnresolvedQuestionService,
  ],
  exports: [ChatbotOrchestratorService, ChatbotMatchingConfigService],
})
export class ChatbotModule {}
