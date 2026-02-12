import api from '../../../services/http/axios.instance';
import type { ApiResponse } from '../../../types/api';
import type {
  LoginRequestDto,
  LoginResponseData,
} from '../types/auth.api.types';

export async function login(
  payload: LoginRequestDto,
): Promise<ApiResponse<LoginResponseData>> {
  const response = await api.post<ApiResponse<LoginResponseData>>(
    '/auth/login',
    payload,
  );
  return response.data;
}
