import api from '../../../services/http/axios.instance';
import type { ApiResponse } from '../../../types/api';
import type {
  ChatbotReplyData,
  ChatbotSessionData,
  SendChatbotMessagePayload,
} from '../types/chatbot.types';

export async function createChatbotSession(
  sessionId?: string,
): Promise<ApiResponse<ChatbotSessionData>> {
  const response = await api.post<ApiResponse<ChatbotSessionData>>(
    '/chatbot/sessions',
    {
      sessionId,
    },
  );

  return response.data;
}

export async function sendChatbotMessage(
  payload: SendChatbotMessagePayload,
): Promise<ApiResponse<ChatbotReplyData>> {
  const response = await api.post<ApiResponse<ChatbotReplyData>>(
    '/chatbot/message',
    payload,
  );

  return response.data;
}
