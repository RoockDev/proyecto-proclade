import api from '../../../services/http/axios.instance';
import type { ApiResponse } from '../../../types/api';

export type ContactFormData = {
  nombre: string;
  apellidos: string;
  email: string;
  telefono?: string;
  mensaje?: string;
};

export async function sendContactForm(
  data: ContactFormData,
): Promise<ApiResponse<{ message: string }>> {
  const response = await api.post<ApiResponse<{ message: string }>>('/colabora/contact', data);
  return response.data;
}