import api from '../../../services/http/axios.instance';
import type { ApiResponse } from '../../../types/api';

export type PublicChallenge = {
  id: number;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  isActive: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function getPublicChallenges(): Promise<ApiResponse<PublicChallenge[]>> {
  const response = await api.get<ApiResponse<PublicChallenge[]>>('/challenges');
  return response.data;
}
