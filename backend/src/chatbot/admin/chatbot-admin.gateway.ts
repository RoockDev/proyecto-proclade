import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: 'admin/chatbot',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})
@Injectable()
export class ChatbotAdminGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatbotAdminGateway.name);
  private readonly adminConnections = new Set<string>();

  handleConnection(client: Socket) {
    this.logger.log(`Admin client connected: ${client.id}`);
    this.adminConnections.add(client.id);
    client.emit('adminConnected', {
      message: 'Conectado al panel de admin de chatbot',
      clientId: client.id,
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Admin client disconnected: ${client.id}`);
    this.adminConnections.delete(client.id);
  }

  broadcastNewMessage(message: unknown) {
    this.server.emit('newMessage', message);
  }

  broadcastUnresolvedQuestionCreated(payload: unknown) {
    this.server.emit('unresolvedQuestionCreated', payload);
  }

  hasConnectedAdmins(): boolean {
    return this.adminConnections.size > 0;
  }
}
