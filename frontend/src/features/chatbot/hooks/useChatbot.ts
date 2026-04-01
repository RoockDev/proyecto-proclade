import { useCallback, useEffect, useState } from 'react';
import {
  createChatbotSession,
  sendChatbotMessage,
} from '../api/chatbot.api';
import type { ChatUiMessage } from '../types/chatbot.types';
import {
  clearChatbotSessionId,
  getChatbotSessionId,
  saveChatbotSessionId,
} from '../utils/chatbot-session.storage';

const DEFAULT_ERROR_MESSAGE =
  'No he podido conectar con el asistente ahora mismo. Inténtalo de nuevo en unos segundos.';

const CHATBOT_WELCOME_MESSAGE: ChatUiMessage = {
  id: 'chatbot-welcome',
  role: 'bot',
  text: 'Hola, soy el asistente de Equipo PUCH. Te ayudo con donaciones, noticias, superhéroes y cómo colaborar.',
  createdAt: new Date().toISOString(),
  suggestions: [
    '¿Cómo puedo donar?',
    '¿Qué es Equipo PUCH?',
    'Enséñame las últimas noticias',
  ],
};

type UseChatbotResult = {
  messages: ChatUiMessage[];
  isSending: boolean;
  errorMessage: string | null;
  sendMessage: (message: string, pageContext?: string) => Promise<void>;
};

export function useChatbot(): UseChatbotResult {
  const [sessionId, setSessionId] = useState<string | null>(() =>
    getChatbotSessionId(),
  );
  const [messages, setMessages] = useState<ChatUiMessage[]>([
    CHATBOT_WELCOME_MESSAGE,
  ]);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const ensureSession = useCallback(async () => {
    const response = await createChatbotSession(sessionId ?? undefined);

    if (!response.success || !response.data?.sessionId) {
      throw new Error(response.message || DEFAULT_ERROR_MESSAGE);
    }

    const nextSessionId = response.data.sessionId;

    if (nextSessionId !== sessionId) {
      setSessionId(nextSessionId);
      saveChatbotSessionId(nextSessionId);
    }

    return nextSessionId;
  }, [sessionId]);

  useEffect(() => {
    void ensureSession().catch(() => {
      clearChatbotSessionId();
      setSessionId(null);
    });
  }, [ensureSession]);

  const sendMessage = useCallback(
    async (rawMessage: string, pageContext?: string) => {
      const trimmedMessage = rawMessage.trim();

      if (!trimmedMessage || isSending) {
        return;
      }

      setErrorMessage(null);
      setMessages((previous) => [
        ...previous,
        buildUiMessage({
          role: 'user',
          text: trimmedMessage,
        }),
      ]);
      setIsSending(true);

      try {
        const activeSessionId = await ensureSession();
        const response = await sendChatbotMessage({
          message: trimmedMessage,
          sessionId: activeSessionId,
          pageContext,
        });

        if (!response.success || !response.data) {
          throw new Error(response.message || DEFAULT_ERROR_MESSAGE);
        }

        const reply = response.data;

        if (reply.sessionId && reply.sessionId !== sessionId) {
          setSessionId(reply.sessionId);
          saveChatbotSessionId(reply.sessionId);
        }

        setMessages((previous) => [
          ...previous,
          buildUiMessage({
            role: 'bot',
            text: reply.answer,
            replyType: reply.replyType,
            ctaLinks: reply.ctaLinks,
            suggestions: reply.suggestions,
          }),
        ]);
      } catch {
        setErrorMessage(DEFAULT_ERROR_MESSAGE);
        clearChatbotSessionId();
        setSessionId(null);
        setMessages((previous) => [
          ...previous,
          buildUiMessage({
            role: 'bot',
            text: DEFAULT_ERROR_MESSAGE,
            replyType: 'FALLBACK',
          }),
        ]);
      } finally {
        setIsSending(false);
      }
    },
    [ensureSession, isSending, sessionId],
  );

  return {
    messages,
    isSending,
    errorMessage,
    sendMessage,
  };
}

function buildUiMessage(payload: Omit<ChatUiMessage, 'id' | 'createdAt'>): ChatUiMessage {
  return {
    id: buildMessageId(),
    createdAt: new Date().toISOString(),
    ...payload,
  };
}

function buildMessageId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
