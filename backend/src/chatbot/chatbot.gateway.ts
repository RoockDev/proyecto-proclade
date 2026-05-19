import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { ChatReplyType } from 'generated/prisma/client';
import { ChatbotOrchestratorService } from './chatbot-orchestrator.service';
import { ChatbotAdminGateway } from './admin/chatbot-admin.gateway';
import { ListChatbotSuggestionsDto } from './dto/list-chatbot-suggestions.dto';
import { RegisterChatbotFeedbackDto } from './dto/register-chatbot-feedback.dto';
import { SendChatMessageDto } from './dto/send-chat-message.dto';

@WebSocketGateway({
  namespace: 'chatbot',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
@Injectable()
export class ChatbotGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatbotGateway.name);
  private readonly clientSessions = new Map<string, string>();

  constructor(
    private readonly chatbotOrchestratorService: ChatbotOrchestratorService,
    private readonly chatbotAdminGateway: ChatbotAdminGateway,
  ) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.clientSessions.delete(client.id);
  }

  @SubscribeMessage('initSession')
  async handleInitSession(
    @ConnectedSocket() client: Socket,
    @MessageBody() data?: { sessionId?: string },
  ) {
    const result = await this.chatbotOrchestratorService.createOrReuseSession(
      data?.sessionId,
    );
    this.clientSessions.set(client.id, result.sessionId);
    client.emit('sessionInitialized', result);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SendChatMessageDto,
  ) {
    const sessionId = data.sessionId || this.clientSessions.get(client.id);
    if (!sessionId) {
      client.emit('error', {
        message: 'No hay sesion inicializada',
        code: 'NO_SESSION',
      });
      return;
    }

    const reply = await this.chatbotOrchestratorService.sendMessage({
      message: data.message,
      sessionId,
      pageContext: data.pageContext,
    });

    client.emit('messageReceived', reply);

    this.emitAdminEvents({
      sessionId,
      userMessage: data.message,
      pageContext: data.pageContext,
      reply,
    });
  }

  @SubscribeMessage('getSuggestions')
  async handleGetSuggestions(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: ListChatbotSuggestionsDto,
  ) {
    const sessionId = data.sessionId || this.clientSessions.get(client.id);
    if (!sessionId) {
      client.emit('error', {
        message: 'No hay sesion inicializada',
        code: 'NO_SESSION',
      });
      return;
    }

    const suggestions = await this.chatbotOrchestratorService.getSuggestions({
      sessionId,
      pageContext: data.pageContext,
      limit: data.limit,
    });
    client.emit('suggestionsReceived', suggestions);
  }

  @SubscribeMessage('registerFeedback')
  async handleRegisterFeedback(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: RegisterChatbotFeedbackDto,
  ) {
    const result = await this.chatbotOrchestratorService.registerFeedback({
      sessionId: data.sessionId,
      messageId: data.messageId,
      helpful: data.helpful,
    });
    client.emit('feedbackRegistered', result);
  }

  @SubscribeMessage('getHealth')
  async handleGetHealth(@ConnectedSocket() client: Socket) {
    const health = await this.chatbotOrchestratorService.getHealth();
    client.emit('healthStatus', health);
  }

  emitAdminEvents(input: {
    sessionId: string;
    userMessage: string;
    pageContext?: string;
    reply: {
      messageId?: number;
      replyType?: ChatReplyType;
      answer?: string;
      confidence?: number;
      detectedIntentCode?: string | null;
    };
  }) {
    if (!this.chatbotAdminGateway.hasConnectedAdmins()) {
      return;
    }

    this.chatbotAdminGateway.broadcastNewMessage({
      type: 'user_message',
      sessionId: input.sessionId,
      message: input.userMessage,
      pageContext: input.pageContext,
      timestamp: new Date().toISOString(),
    });

    this.chatbotAdminGateway.broadcastNewMessage({
      type: 'bot_reply',
      sessionId: input.sessionId,
      replyText: input.reply.answer ?? '',
      messageId: input.reply.messageId,
      detectedIntentCode: input.reply.detectedIntentCode ?? null,
      replyType: input.reply.replyType ?? null,
      confidence: input.reply.confidence ?? null,
      timestamp: new Date().toISOString(),
    });

    if (input.reply.replyType === ChatReplyType.FALLBACK) {
      this.chatbotAdminGateway.broadcastUnresolvedQuestionCreated({
        type: 'unresolved_question_created',
        sessionId: input.sessionId,
        message: input.userMessage,
        pageContext: input.pageContext ?? null,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
