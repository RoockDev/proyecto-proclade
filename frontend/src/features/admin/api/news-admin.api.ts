import type { AxiosResponse } from 'axios';
import api from '../../../services/http/axios.instance';
import type { ApiResponse } from '../../../types/api';
import { getAuthSession } from '../../auth/utils/auth-session.storage';
import type {
  AdminNewsItem,
  CreateAdminNewsPayload,
  UpdateAdminNewsPayload,
} from '../types/news-admin.types';

const authHeaders = () => {
  const token = getAuthSession().accessToken;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResponse = <T>(response: AxiosResponse<ApiResponse<T>>) => response.data;

export const listAdminNews = async () => {
  const response = await api.get<ApiResponse<AdminNewsItem[]>>('/admin/news', {
    headers: authHeaders(),
  });

  return handleResponse(response);
};

export const createAdminNews = async (payload: CreateAdminNewsPayload) => {
  const response = await api.post<ApiResponse<{ news: AdminNewsItem }>>(
    '/admin/news',
    payload,
    {
      headers: authHeaders(),
    },
  );

  return handleResponse(response);
};

export const updateAdminNews = async (payload: UpdateAdminNewsPayload) => {
  const { id, ...body } = payload;
  const response = await api.patch<ApiResponse<{ news: AdminNewsItem }>>(
    `/admin/news/${id}`,
    body,
    {
      headers: authHeaders(),
    },
  );

  return handleResponse(response);
};

export const deleteAdminNews = async (id: number) => {
  const response = await api.delete<ApiResponse<null>>(`/admin/news/${id}`, {
    headers: authHeaders(),
  });

  return handleResponse(response);
};

export const uploadAdminNewsImage = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post<ApiResponse<{ imageUrl: string }>>(
    '/admin/news/upload-image',
    formData,
    {
      headers: {
        ...authHeaders(),
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  return handleResponse(response);
};

export const deleteUploadedAdminNewsImage = async (imageUrl: string) => {
  const response = await api.delete<ApiResponse<null>>('/admin/news/upload-image', {
    data: { imageUrl },
    headers: authHeaders(),
  });

  return handleResponse(response);
};
