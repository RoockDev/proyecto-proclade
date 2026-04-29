import type { AxiosResponse } from 'axios';
import api from '../../../services/http/axios.instance';
import type { ApiResponse } from '../../../types/api';
import { getAuthSession } from '../../auth/utils/auth-session.storage';
import type {
  AdminRegion,
  CreateRegionPayload,
  UpdateRegionPayload,
} from '../types/regions.types';

const authHeaders = () => {
  const token = getAuthSession().accessToken;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResponse = <T>(response: AxiosResponse<ApiResponse<T>>) => response.data;

export const listRegions = async (search?: string) => {
  const response = await api.get<ApiResponse<AdminRegion[]>>('/admin/regions', {
    headers: authHeaders(),
    params: search?.trim() ? { search: search.trim() } : {},
  });

  return handleResponse(response);
};

export const createRegion = async (payload: CreateRegionPayload) => {
  const response = await api.post<ApiResponse<{ region: AdminRegion }>>(
    '/admin/regions',
    payload,
    {
      headers: authHeaders(),
    },
  );

  return handleResponse(response);
};

export const updateRegion = async (payload: UpdateRegionPayload) => {
  const { id, ...body } = payload;
  const response = await api.patch<ApiResponse<{ region: AdminRegion }>>(
    `/admin/regions/${id}`,
    body,
    {
      headers: authHeaders(),
    },
  );

  return handleResponse(response);
};

export const deleteRegion = async (id: number) => {
  const response = await api.delete<ApiResponse<null>>(`/admin/regions/${id}`, {
    headers: authHeaders(),
  });

  return handleResponse(response);
};
