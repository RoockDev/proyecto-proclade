import type { AxiosResponse } from 'axios';
import api from '../../../services/http/axios.instance';
import type { ApiResponse } from '../../../types/api';
import { getAuthSession } from '../../auth/utils/auth-session.storage';
import type {
  ChangePasswordPayload,
  UpdateProfilePayload,
  UserProfile,
} from '../types/profile.types';

const authHeaders = () => {
  const token = getAuthSession().accessToken;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResponse = <T>(response: AxiosResponse<ApiResponse<T>>) => response.data;

export const getMyProfile = async (): Promise<ApiResponse<UserProfile>> => {
  const response = await api.get<ApiResponse<UserProfile>>('/users/me', {
    headers: authHeaders(),
  });

  return handleResponse(response);
};

export const updateMyProfile = async (
  payload: UpdateProfilePayload,
): Promise<ApiResponse<UserProfile>> => {
  const response = await api.patch<ApiResponse<UserProfile>>('/users/me', payload, {
    headers: authHeaders(),
  });

  return handleResponse(response);
};

export const changeMyPassword = async (
  payload: ChangePasswordPayload,
): Promise<ApiResponse<null>> => {
  const response = await api.patch<ApiResponse<null>>('/auth/change-password', payload, {
    headers: authHeaders(),
  });

  return handleResponse(response);
};
