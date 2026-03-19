import type { AxiosResponse } from 'axios';
import api from '../../../services/http/axios.instance';
import type { ApiResponse } from '../../../types/api';
import { getAuthSession } from '../../auth/utils/auth-session.storage';
import type {
  AdminHumanBook,
  RegionOption,
} from '../types/human-books.types';

const authHeaders = () => {
  const token = getAuthSession().accessToken;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResponse = <T>(response: AxiosResponse<ApiResponse<T>>) => response.data;

export const listHumanBooks = async () => {
  const response = await api.get<ApiResponse<AdminHumanBook[]>>(
    '/admin/human-books',
    { headers: authHeaders() },
  );
  return handleResponse(response);
};

export const createHumanBook = async (data: {
  name: string;
  title: string;
  regionId: number;
  pdf: File;
}) => {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('title', data.title);
  formData.append('regionId', String(data.regionId));
  formData.append('pdf', data.pdf);

  const response = await api.post<ApiResponse<{ humanBook: AdminHumanBook }>>(
    '/admin/human-books',
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

export const updateHumanBook = async (data: {
  id: number;
  name?: string;
  title?: string;
  regionId?: number;
  pdf?: File;
}) => {
  const { id, ...fields } = data;
  const formData = new FormData();

  if (fields.name !== undefined) formData.append('name', fields.name);
  if (fields.title !== undefined) formData.append('title', fields.title);
  if (fields.regionId !== undefined)
    formData.append('regionId', String(fields.regionId));
  if (fields.pdf) formData.append('pdf', fields.pdf);

  const response = await api.patch<ApiResponse<{ humanBook: AdminHumanBook }>>(
    `/admin/human-books/${id}`,
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

export const deleteHumanBook = async (id: number) => {
  const response = await api.delete<ApiResponse<null>>(
    `/admin/human-books/${id}`,
    { headers: authHeaders() },
  );
  return handleResponse(response);
};

export const listRegionOptions = async () => {
  const response = await api.get<ApiResponse<RegionOption[]>>(
    '/admin/regions/options',
    { headers: authHeaders() },
  );
  return handleResponse(response);
};
