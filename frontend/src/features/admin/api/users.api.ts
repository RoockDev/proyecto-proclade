import type { AxiosResponse } from 'axios';
import api from '../../../services/http/axios.instance';
import { getAuthSession } from '../../auth/utils/auth-session.storage';
import type {
  AdminUser,
  ApiResponse,
  CreateUserPayload,
  UpdateUserPayload,
} from '../types/users.types';

const authHeaders = () => {
  const token = getAuthSession().accessToken;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResponse = <T>(response: AxiosResponse<ApiResponse<T>>) => response.data;

export const listUsers = async (includeDeleted = false) => {
  const response = await api.get<ApiResponse<AdminUser[]>>('/users', {
    headers: authHeaders(),
    params: includeDeleted ? { includeDeleted: true } : {},
  });
  return handleResponse(response);
};

export const createUser = async (payload: CreateUserPayload) => {
  const response = await api.post<ApiResponse<AdminUser>>('/users', payload, {
    headers: authHeaders(),
  });
  return handleResponse(response);
};

export const updateUser = async (payload: UpdateUserPayload) => {
  const { id, ...body } = payload;
  const response = await api.patch<ApiResponse<AdminUser>>(`/users/${id}`, body, {
    headers: authHeaders(),
  });
  return handleResponse(response);
};

export const deleteUser = async (id: number) => {
  const response = await api.delete<ApiResponse<null>>(`/users/${id}`, {
    headers: authHeaders(),
  });
  return handleResponse(response);
};

export const reactivateUser = async (id: number) => {
  const response = await api.post<ApiResponse<AdminUser>>(
    `/users/${id}/restore`,
    {},
    {
      headers: authHeaders(),
    },
  );
  return handleResponse(response);
};

export const toggleUserRealHero = async (id: number, enabled: boolean) => {
  const response = await api.patch<ApiResponse<null>>(
    `/users/${id}/real-hero`,
    { enabled },
    {
      headers: authHeaders(),
    },
  );
  return handleResponse(response);
};
