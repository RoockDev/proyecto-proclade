import { Body, Controller, Get, Post } from '@nestjs/common';
import { ChatbotOrchestratorService } from './chatbot-orchestrator.service';
import { CreateChatSessionDto } from './dto/create-chat-session.dto';
import { SendChatMessageDto } from './dto/send-chat-message.dto';

@Controller('chatbot')
export class ChatbotController {
  constructor(
    private readonly chatbotOrchestratorService: ChatbotOrchestratorService,
  ) {}

  @Post('sessions')
  createSession(@Body() createChatSessionDto: CreateChatSessionDto) {
    return this.chatbotOrchestratorService.createOrReuseSession(
      createChatSessionDto.sessionId,
    );
  }

  @Post('message')
  sendMessage(@Body() sendChatMessageDto: SendChatMessageDto) {
    return this.chatbotOrchestratorService.sendMessage({
      message: sendChatMessageDto.message,
      sessionId: sendChatMessageDto.sessionId,
      pageContext: sendChatMessageDto.pageContext,
    });
  }

  @Get('health')
  health() {
    return this.chatbotOrchestratorService.getHealth();
  }
}
