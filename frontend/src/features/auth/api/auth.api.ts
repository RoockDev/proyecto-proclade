import api from '../../../services/http/axios.instance';
import type { ApiResponse } from '../../../types/api';
import type {
  LoginRequestDto,
  AuthResponseData,
  RegisterRequestDto,
  GoogleSignInRequestDto,
  ForgotPasswordRequestDto,
  ResetPasswordRequestDto,
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

export async function googleSignIn(
  payload: GoogleSignInRequestDto,
): Promise<ApiResponse<AuthResponseData>> {
  const response = await api.post<ApiResponse<AuthResponseData>>(
    '/auth/google',
    payload,
  );
  return response.data;
}

export async function forgotPassword(
  payload: ForgotPasswordRequestDto,
): Promise<ApiResponse<null>> {
  const response = await api.post<ApiResponse<null>>(
    '/auth/forgot-password',
    payload,
  );
  return response.data;
}

export async function resetPassword(
  payload: ResetPasswordRequestDto,
): Promise<ApiResponse<null>> {
  const response = await api.post<ApiResponse<null>>(
    '/auth/reset-password',
    payload,
  );
  return response.data;
}
