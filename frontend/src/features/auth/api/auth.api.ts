import api from '../../../services/http/axios.instance';
import type { ApiResponse } from '../../../types/api';
import type {
  LoginRequestDto,
  AuthResponseData,
  RegisterRequestDto,
} from '../types/auth.api.types';

export async function login(
  payload: LoginRequestDto,
): Promise<ApiResponse<AuthResponseData>> {
  const response = await api.post<ApiResponse<AuthResponseData>>(
    '/auth/login',
    payload,
  );
  return response.data;
}


export const register = async (
  payload: RegisterRequestDto,
): Promise<ApiResponse<AuthResponseData>> => {
  const response = await api.post<ApiResponse<AuthResponseData>>(
    '/auth/register',
    payload,
  );
  return response.data;
};