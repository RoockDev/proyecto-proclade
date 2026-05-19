import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ChatbotOrchestratorService } from './chatbot-orchestrator.service';
import { ChatbotGateway } from './chatbot.gateway';
import { CreateChatSessionDto } from './dto/create-chat-session.dto';
import { ListChatbotSuggestionsDto } from './dto/list-chatbot-suggestions.dto';
import { RegisterChatbotFeedbackDto } from './dto/register-chatbot-feedback.dto';
import { SendChatMessageDto } from './dto/send-chat-message.dto';

@Controller('chatbot')
export class ChatbotController {
  constructor(
    private readonly chatbotOrchestratorService: ChatbotOrchestratorService,
    private readonly chatbotGateway: ChatbotGateway,
  ) {}

  @Post('sessions')
  createSession(@Body() createChatSessionDto: CreateChatSessionDto) {
    return this.chatbotOrchestratorService.createOrReuseSession(
      createChatSessionDto.sessionId,
    );
  }

  @Post('message')
  async sendMessage(@Body() sendChatMessageDto: SendChatMessageDto) {
    const reply = await this.chatbotOrchestratorService.sendMessage({
      message: sendChatMessageDto.message,
      sessionId: sendChatMessageDto.sessionId,
      pageContext: sendChatMessageDto.pageContext,
    });

    this.chatbotGateway.emitAdminEvents({
      sessionId: reply.sessionId,
      userMessage: sendChatMessageDto.message,
      pageContext: sendChatMessageDto.pageContext,
      reply,
    });

    return reply;
  }

  @Get('suggestions')
  suggestions(@Query() query: ListChatbotSuggestionsDto) {
    return this.chatbotOrchestratorService.getSuggestions({
      sessionId: query.sessionId,
      pageContext: query.pageContext,
      limit: query.limit,
    });
  }

  @Post('feedback')
  registerFeedback(
    @Body() registerChatbotFeedbackDto: RegisterChatbotFeedbackDto,
  ) {
    return this.chatbotOrchestratorService.registerFeedback({
      sessionId: registerChatbotFeedbackDto.sessionId,
      messageId: registerChatbotFeedbackDto.messageId,
      helpful: registerChatbotFeedbackDto.helpful,
    });
  }

  @Get('health')
  health() {
    return this.chatbotOrchestratorService.getHealth();
  }
}
