import type { AxiosResponse } from 'axios';
import api from '../../../services/http/axios.instance';
import type { ApiResponse } from '../../../types/api';
import { getAuthSession } from '../../auth/utils/auth-session.storage';
import type { AdminNewsItem } from '../types/news-admin.types';

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
