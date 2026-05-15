import { io, Socket } from 'socket.io-client';

type AdminWsListener = (payload: any) => void;

const rawApiBase =
  import.meta.env.VITE_API_BASE_URL?.toString().trim() ||
  'http://localhost:3000';
const socketBaseUrl = rawApiBase.replace(/\/+$/, '').replace(/\/api$/, '');
const namespacePath = '/admin/chatbot';

class AdminChatbotWebSocketService {
  private socket: Socket | null = null;
  private connectPromise: Promise<void> | null = null;
  private listeners = new Map<string, Set<AdminWsListener>>();

  connect(): Promise<void> {
    if (this.socket?.connected) {
      return Promise.resolve();
    }

    if (this.connectPromise) {
      return this.connectPromise;
    }

    this.connectPromise = new Promise<void>((resolve, reject) => {
      this.socket = io(`${socketBaseUrl}${namespacePath}`, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });

      const handleConnect = () => {
        this.emit('wsConnected', { clientId: this.socket?.id });
        resolve();
      };

      const handleConnectError = (error: unknown) => {
        this.emit('wsError', { error });
        reject(error);
      };

      this.socket.once('connect', handleConnect);
      this.socket.once('connect_error', handleConnectError);

      this.socket.on('disconnect', () => {
        this.emit('wsDisconnected', {});
      });

      this.socket.on('adminConnected', (payload) => {
        this.emit('adminConnected', payload);
      });
      this.socket.on('newMessage', (payload) => this.emit('newMessage', payload));
      this.socket.on('unresolvedQuestionCreated', (payload) =>
        this.emit('unresolvedQuestionCreated', payload),
      );
      this.socket.on('error', (payload) => this.emit('error', payload));
    }).finally(() => {
      this.connectPromise = null;
    });

    return this.connectPromise;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, listener: AdminWsListener): () => void {
    const listeners = this.listeners.get(event) ?? new Set<AdminWsListener>();
    listeners.add(listener);
    this.listeners.set(event, listeners);

    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) {
        this.listeners.delete(event);
      }
    };
  }

  private emit(event: string, payload: any) {
    const listeners = this.listeners.get(event);
    if (!listeners) {
      return;
    }

    listeners.forEach((listener) => {
      listener(payload);
    });
  }
}

export const adminChatbotWsService = new AdminChatbotWebSocketService();
