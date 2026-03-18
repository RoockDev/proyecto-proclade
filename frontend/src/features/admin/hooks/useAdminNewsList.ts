import { useCallback, useEffect, useMemo, useState } from 'react';
import { listAdminNews } from '../api/news-admin.api';
import type { AdminNewsItem } from '../types/news-admin.types';

type UseAdminNewsListOptions = {
  onError?: (message: string) => void;
};

const orderNews = (items: AdminNewsItem[]) =>
  [...items].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

export const useAdminNewsList = ({ onError }: UseAdminNewsListOptions = {}) => {
  const [news, setNews] = useState<AdminNewsItem[]>([]);
  const [search, setSearch] = useState('');
  const [isFetching, setIsFetching] = useState(false);

  const refreshNews = useCallback(async () => {
    setIsFetching(true);
    try {
      const response = await listAdminNews();

      if (response.success) {
        setNews(Array.isArray(response.data) ? response.data : []);
        return;
      }

      onError?.(response.message || 'No se pudo cargar la lista de noticias.');
    } catch {
      onError?.('No se pudo actualizar la lista de noticias.');
    } finally {
      setIsFetching(false);
    }
  }, [onError]);

  useEffect(() => {
    refreshNews();
  }, [refreshNews]);

  const orderedNews = useMemo(() => orderNews(news), [news]);

  const filteredNews = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return orderedNews;
    }

    return orderedNews.filter((item) =>
      [item.title, item.excerpt, item.slug].some((field) =>
        field.toLowerCase().includes(term),
      ),
    );
  }, [orderedNews, search]);

  return {
    filteredNews,
    isFetching,
    refreshNews,
    search,
    setSearch,
  };
};
