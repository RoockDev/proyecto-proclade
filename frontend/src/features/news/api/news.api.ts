import api from '../../../services/http/axios.instance';
import type { ApiResponse } from '../../../types/api';
import {
  getMockLatestNews,
  getMockNewsBySlug,
  getMockNewsList,
} from '../mocks/news.mocks';
import type { NewsApiItem, NewsItem } from '../types/news.types';
import { mapNewsApiItem, normalizeNewsCollection } from '../utils/news.mapper';

export async function getLatestNews(limit: number): Promise<ApiResponse<NewsItem[]>> {
  if (isNewsMockModeEnabled()) {
    return {
      success: true,
      message: 'Modo mock de noticias activado',
      data: getMockLatestNews(limit),
    };
  }

  const response = await api.get<ApiResponse<NewsApiItem[]>>('/news', {
    params: { limit },
  });

  const items = normalizeNewsCollection(toNewsItems(response.data.data)).slice(
    0,
    Math.max(limit, 0),
  );

  return {
    ...response.data,
    data: items,
  };
}

export async function getNewsList(): Promise<ApiResponse<NewsItem[]>> {
  if (isNewsMockModeEnabled()) {
    return {
      success: true,
      message: 'Modo mock de noticias activado',
      data: getMockNewsList(),
    };
  }

  const response = await api.get<ApiResponse<NewsApiItem[]>>('/news');

  return {
    ...response.data,
    data: normalizeNewsCollection(toNewsItems(response.data.data)),
  };
}

export async function getNewsBySlug(
  slug: string,
): Promise<ApiResponse<NewsItem>> {
  if (isNewsMockModeEnabled()) {
    const mockNewsItem = getMockNewsBySlug(slug);

    return {
      success: Boolean(mockNewsItem),
      message: mockNewsItem
        ? 'Modo mock de noticias activado'
        : 'Noticia no encontrada en modo mock',
      data: mockNewsItem,
    };
  }

  const response = await api.get<ApiResponse<NewsApiItem>>(`/news/${slug}`);

  return {
    ...response.data,
    data: response.data.data ? mapNewsApiItem(response.data.data) : null,
  };
}

function toNewsItems(data: NewsApiItem[] | null): NewsItem[] {
  if (!Array.isArray(data)) {
    return [];
  }

  return data.map(mapNewsApiItem);
}

function isNewsMockModeEnabled(): boolean {
  return import.meta.env.VITE_NEWS_FORCE_MOCKS === 'true';
}
