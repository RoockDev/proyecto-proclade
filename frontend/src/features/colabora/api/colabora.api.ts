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
): Promise<ApiResponse<null>> {
  const response = await api.post<ApiResponse<null>>('/colabora/contact', data);
  return response.data;
}
