import type { AxiosResponse } from 'axios';
import { getAuthSession } from '../../auth/utils/auth-session.storage';
import api from '../../../services/http/axios.instance';
import type { ApiResponse } from '../../../types/api';
import type {
  AdminChallenge,
  CreateChallengePayload,
  UpdateChallengePayload,
  UpdateChallengeAmountPayload,
} from '../types/challenges.types';

const authHeaders = () => {
  const token = getAuthSession().accessToken;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResponse = <T>(response: AxiosResponse<ApiResponse<T>>) =>
  response.data;

export const listAdminChallenges = async () => {
  const response = await api.get<ApiResponse<AdminChallenge[]>>(
    '/admin/challenges',
    { headers: authHeaders() },
  );
  return handleResponse(response);
};

export const createAdminChallenge = async (payload: CreateChallengePayload) => {
  const response = await api.post<ApiResponse<AdminChallenge>>(
    '/admin/challenges',
    payload,
    { headers: authHeaders() },
  );
  return handleResponse(response);
};

export const updateAdminChallenge = async (payload: UpdateChallengePayload) => {
  const { id, ...body } = payload;
  const response = await api.patch<ApiResponse<AdminChallenge>>(
    `/admin/challenges/${id}`,
    body,
    { headers: authHeaders() },
  );
  return handleResponse(response);
};

export const updateAdminChallengeAmount = async (
  payload: UpdateChallengeAmountPayload,
) => {
  const response = await api.patch<ApiResponse<AdminChallenge>>(
    `/admin/challenges/${payload.id}/amount`,
    { currentAmount: payload.currentAmount },
    { headers: authHeaders() },
  );
  return handleResponse(response);
};

export const deleteAdminChallenge = async (id: number) => {
  const response = await api.delete<ApiResponse<null>>(
    `/admin/challenges/${id}`,
    { headers: authHeaders() },
  );
  return handleResponse(response);
};
