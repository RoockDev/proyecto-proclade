import api from '../../../services/http/axios.instance';
import type { ApiResponse } from '../../../types/api';
import type {
  ChatbotSuggestionsData,
  ChatbotReplyData,
  ChatbotSessionData,
  ListChatbotSuggestionsPayload,
  SendChatbotFeedbackPayload,
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

export const listChatbotSuggestions = async (
  payload: ListChatbotSuggestionsPayload,
): Promise<ApiResponse<ChatbotSuggestionsData>> => {
  const response = await api.get<ApiResponse<ChatbotSuggestionsData>>(
    '/chatbot/suggestions',
    {
      params: payload,
    },
  );

  return response.data;
};

export const sendChatbotFeedback = async (
  payload: SendChatbotFeedbackPayload,
): Promise<ApiResponse<null>> => {
  const response = await api.post<ApiResponse<null>>(
    '/chatbot/feedback',
    payload,
  );

  return response.data;
};
