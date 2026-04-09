import api from '../../../services/http/axios.instance';
import type { ApiResponse } from '../../../types/api';
import type { SuperheroListApiData } from '../types/superheroes.types';
import { normalizeSuperheroCollection } from '../utils/superheroes.mapper';

export async function getSuperheroesList(
  page: number,
  pageSize: number,
): Promise<ApiResponse<SuperheroListApiData>> {
  const response = await api.get<ApiResponse<SuperheroListApiData>>('/superheroes', {
    params: { page, pageSize },
  });

  const normalizedItems = normalizeSuperheroCollection(response.data.data?.items ?? []);

  return {
    ...response.data,
    data: response.data.data
      ? {
          ...response.data.data,
          items: normalizedItems,
        }
      : null,
  };
}
