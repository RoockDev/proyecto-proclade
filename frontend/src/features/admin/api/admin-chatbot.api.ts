import type { AxiosResponse } from 'axios';
import api from '../../../services/http/axios.instance';
import type { ApiResponse } from '../../../types/api';
import { getAuthSession } from '../../auth/utils/auth-session.storage';
import type {
  ChatbotIntentItem,
  ChatbotKnowledgeList,
  ChatbotMetricsData,
  ChatbotUnresolvedQuestion,
} from '../types/chatbot-admin.types';

const authHeaders = () => {
  const token = getAuthSession().accessToken;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResponse = <T>(response: AxiosResponse<ApiResponse<T>>) =>
  response.data;

export const fetchChatbotMetrics = async (params?: {
  startDate?: string;
  endDate?: string;
}) => {
  const response = await api.get<ApiResponse<{ metrics: ChatbotMetricsData }>>(
    '/admin/chatbot/metrics',
    {
      params,
      headers: authHeaders(),
    },
  );

  return handleResponse(response);
};

export const listChatbotUnresolved = async (query?: {
  resolved?: boolean;
  minOccurrences?: number;
  search?: string;
  page?: number;
  pageSize?: number;
}) => {
  const response = await api.get<
    ApiResponse<{ unresolved: { items: ChatbotUnresolvedQuestion[]; total: number } }>
  >('/admin/chatbot/unresolved', {
    params: query,
    headers: authHeaders(),
  });

  return handleResponse(response);
};

export const resolveChatbotUnresolved = async (id: number) => {
  const response = await api.patch<ApiResponse<{ unresolved: ChatbotUnresolvedQuestion }>>(
    `/admin/chatbot/unresolved/${id}/resolve`,
    undefined,
    {
      headers: authHeaders(),
    },
  );

  return handleResponse(response);
};

export const reopenChatbotUnresolved = async (id: number) => {
  const response = await api.patch<ApiResponse<{ unresolved: ChatbotUnresolvedQuestion }>>(
    `/admin/chatbot/unresolved/${id}/reopen`,
    undefined,
    {
      headers: authHeaders(),
    },
  );

  return handleResponse(response);
};

export const deleteChatbotUnresolved = async (id: number) => {
  const response = await api.delete<ApiResponse<{ deleted: boolean; id: number }>>(
    `/admin/chatbot/unresolved/${id}`,
    {
      headers: authHeaders(),
    },
  );

  return handleResponse(response);
};

export const listChatbotKnowledge = async (query?: {
  search?: string;
  intentId?: number;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}) => {
  const response = await api.get<ApiResponse<{ knowledge: ChatbotKnowledgeList }>>(
    '/admin/chatbot/knowledge-items',
    {
      params: query,
      headers: authHeaders(),
    },
  );

  return handleResponse(response);
};

export const createChatbotKnowledge = async (payload: {
  questionCanonical: string;
  answer: string;
  intentId?: number;
  tags?: string[];
  route?: string;
  ctaLinks?: { label: string; to: string }[];
  isActive?: boolean;
  unresolvedQuestionId?: number;
}) => {
  const response = await api.post<
    ApiResponse<{ knowledge: ChatbotKnowledgeList['items'][number] }>
  >('/admin/chatbot/knowledge-items', payload, {
    headers: authHeaders(),
  });

  return handleResponse(response);
};

export const updateChatbotKnowledge = async (payload: {
  id: number;
  questionCanonical?: string;
  answer?: string;
  intentId?: number;
  tags?: string[];
  route?: string | null;
  ctaLinks?: { label: string; to: string }[];
  isActive?: boolean;
}) => {
  const { id, ...body } = payload;
  const response = await api.patch<
    ApiResponse<{ knowledge: ChatbotKnowledgeList['items'][number] }>
  >(`/admin/chatbot/knowledge-items/${id}`, body, {
    headers: authHeaders(),
  });

  return handleResponse(response);
};

export const deleteChatbotKnowledge = async (id: number) => {
  const response = await api.delete<ApiResponse<{ deleted: boolean; id: number }>>(
    `/admin/chatbot/knowledge-items/${id}`,
    {
      headers: authHeaders(),
    },
  );

  return handleResponse(response);
};

export const listChatbotIntents = async () => {
  const response = await api.get<ApiResponse<{ intents: ChatbotIntentItem[] }>>(
    '/admin/chatbot/intents',
    {
      headers: authHeaders(),
    },
  );

  return handleResponse(response);
};

export const createChatbotIntent = async (payload: {
  code: string;
  name: string;
  description?: string;
  priority?: number;
  isActive?: boolean;
  phrases?: {
    text: string;
    language?: string;
    weight?: number;
    isActive?: boolean;
  }[];
}) => {
  const response = await api.post<ApiResponse<{ intent: ChatbotIntentItem }>>(
    '/admin/chatbot/intents',
    payload,
    {
      headers: authHeaders(),
    },
  );

  return handleResponse(response);
};

export const updateChatbotIntent = async (payload: {
  id: number;
  name?: string;
  description?: string;
  priority?: number;
  isActive?: boolean;
}) => {
  const { id, ...body } = payload;
  const response = await api.patch<ApiResponse<{ intent: ChatbotIntentItem }>>(
    `/admin/chatbot/intents/${id}`,
    body,
    {
      headers: authHeaders(),
    },
  );

  return handleResponse(response);
};

export const createChatbotIntentPhrase = async (payload: {
  intentId: number;
  text: string;
  language?: string;
  weight?: number;
  isActive?: boolean;
}) => {
  const { intentId, ...body } = payload;
  const response = await api.post<
    ApiResponse<{ phrase: ChatbotIntentItem['phrases'][number] }>
  >(`/admin/chatbot/intents/${intentId}/phrases`, body, {
    headers: authHeaders(),
  });

  return handleResponse(response);
};

export const updateChatbotIntentPhrase = async (payload: {
  intentId: number;
  phraseId: number;
  text?: string;
  language?: string;
  weight?: number;
  isActive?: boolean;
}) => {
  const { intentId, phraseId, ...body } = payload;
  const response = await api.patch<
    ApiResponse<{ phrase: ChatbotIntentItem['phrases'][number] }>
  >(`/admin/chatbot/intents/${intentId}/phrases/${phraseId}`, body, {
    headers: authHeaders(),
  });

  return handleResponse(response);
};

export const updateChatbotConfig = async (payload: {
  weights?: {
    keyword: number;
    fuzzy: number;
    semantic: number;
    context: number;
  };
  thresholds?: {
    directAnswer: number;
    clarification: number;
  };
  fuzzyInternalMin?: number;
}) => {
  const response = await api.patch<
    ApiResponse<{ config: Record<string, unknown> }>
  >('/admin/chatbot/config', payload, {
    headers: authHeaders(),
  });

  return handleResponse(response);
};
