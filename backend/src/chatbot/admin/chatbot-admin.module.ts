import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { ChatbotModule } from '../chatbot.module';
import { ChatbotAdminController } from './chatbot-admin.controller';
import { ChatbotAdminService } from './chatbot-admin.service';

@Module({
  imports: [PrismaModule, AuthModule, ChatbotModule],
  controllers: [ChatbotAdminController],
  providers: [ChatbotAdminService],
})
export class ChatbotAdminModule {}
