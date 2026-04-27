import api from '../../../services/http/axios.instance';
import type { ApiResponse } from '../../../types/api';
import type {
  HumanBookApiItem,
  PublicRegionApiItem,
} from '../types/human-libraries.types';

export const getPublicRegions = async (): Promise<
  ApiResponse<PublicRegionApiItem[]>
> => {
  const response = await api.get<ApiResponse<PublicRegionApiItem[]>>('/regions');

  return response.data;
};

export const getPublishedHumanBooks = async (): Promise<
  ApiResponse<HumanBookApiItem[]>
> => {
  const response = await api.get<ApiResponse<HumanBookApiItem[]>>('/human-books');

  return response.data;
};
