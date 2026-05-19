import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { ChatbotModule } from '../chatbot.module';
import { ChatbotAdminController } from './chatbot-admin.controller';
import { ChatbotAdminService } from './chatbot-admin.service';
import { ChatbotAdminGateway } from './chatbot-admin.gateway';

@Module({
  imports: [PrismaModule, AuthModule, forwardRef(() => ChatbotModule)],
  controllers: [ChatbotAdminController],
  providers: [ChatbotAdminService, ChatbotAdminGateway],
  exports: [ChatbotAdminGateway],
})
export class ChatbotAdminModule {}
