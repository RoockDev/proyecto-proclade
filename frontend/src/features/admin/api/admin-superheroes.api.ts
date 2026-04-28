import type { AxiosResponse } from 'axios';
import { getAuthSession } from '../../auth/utils/auth-session.storage';
import api from '../../../services/http/axios.instance';
import type { ApiResponse } from '../../../types/api';
import type {
  AdminSuperheroesListData,
  AdminSuperheroesListParams,
  AdminSuperheroRow,
  CreateSuperheroPayload,
  UpdateSuperheroPayload,
  UpdateSuperheroStatusPayload,
} from '../types/superheroes.types';

const authHeaders = () => {
  const token = getAuthSession().accessToken;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResponse = <T>(response: AxiosResponse<ApiResponse<T>>) => response.data;

const buildFormData = (payload: Partial<CreateSuperheroPayload>) => {
  const formData = new FormData();

  const appendIfDefined = (key: string, value: string | number | undefined) => {
    if (value === undefined) {
      return;
    }
    formData.append(key, String(value));
  };

  appendIfDefined('name', payload.name);
  appendIfDefined('description', payload.description);
  appendIfDefined('quote', payload.quote);
  appendIfDefined('country', payload.country);
  appendIfDefined('status', payload.status);
  appendIfDefined('sortOrder', payload.sortOrder);

  if (payload.image) {
    formData.append('image', payload.image);
  }

  return formData;
};

const multipartHeaders = () => ({
  ...authHeaders(),
  'Content-Type': 'multipart/form-data',
});

export const listAdminSuperheroes = async (params: AdminSuperheroesListParams = {}) => {
  const response = await api.get<ApiResponse<AdminSuperheroesListData>>('/admin/superheroes', {
    headers: authHeaders(),
    params,
  });
  return handleResponse(response);
};

export const createAdminSuperhero = async (payload: CreateSuperheroPayload) => {
  const response = await api.post<ApiResponse<AdminSuperheroRow>>(
    '/admin/superheroes',
    buildFormData(payload),
    {
      headers: multipartHeaders(),
    },
  );
  return handleResponse(response);
};

export const updateAdminSuperhero = async (payload: UpdateSuperheroPayload) => {
  const { id, ...body } = payload;
  const response = await api.patch<ApiResponse<AdminSuperheroRow>>(
    `/admin/superheroes/${id}`,
    buildFormData(body),
    {
      headers: multipartHeaders(),
    },
  );
  return handleResponse(response);
};

export const updateAdminSuperheroStatus = async (payload: UpdateSuperheroStatusPayload) => {
  const response = await api.patch<ApiResponse<null>>(
    `/admin/superheroes/${payload.id}/status`,
    { status: payload.status },
    {
      headers: authHeaders(),
    },
  );
  return handleResponse(response);
};

export const deleteAdminSuperhero = async (id: number) => {
  const response = await api.delete<ApiResponse<null>>(`/admin/superheroes/${id}`, {
    headers: authHeaders(),
  });
  return handleResponse(response);
};

export const restoreAdminSuperhero = async (id: number) => {
  const response = await api.patch<ApiResponse<AdminSuperheroRow>>(
    `/admin/superheroes/${id}/restore`,
    undefined,
    {
      headers: authHeaders(),
    },
  );
  return handleResponse(response);
};

export const deleteAdminSuperheroPermanently = async (id: number) => {
  const response = await api.delete<ApiResponse<null>>(
    `/admin/superheroes/${id}/permanent`,
    {
      headers: authHeaders(),
    },
  );
  return handleResponse(response);
};
