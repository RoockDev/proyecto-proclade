import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getNewsList } from '../../api/news.api';
import { NewsGrid } from '../../components/NewsGrid/NewsGrid';
import { NewsPagination } from '../../components/NewsPagination/NewsPagination';
import { getMockNewsList } from '../../mocks/news.mocks';
import type { NewsItem, NewsListState } from '../../types/news.types';
import { buildNewsListState } from '../../utils/news.mapper';
import './NewsListPage.css';

const PAGE_SIZE = 9;

export const NewsListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allNewsItems, setAllNewsItems] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  const rawPageParam = searchParams.get('page');
  const currentPage = sanitizePage(rawPageParam);

  useEffect(() => {
    if (rawPageParam === null || rawPageParam !== String(currentPage)) {
      setSearchParams({ page: String(currentPage) }, { replace: true });
    }
  }, [rawPageParam, currentPage, setSearchParams]);

  useEffect(() => {
    let isMounted = true;

    const loadNews = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const response = await getNewsList();

        if (!response.success) {
          throw new Error(response.message || 'No se pudieron cargar las noticias.');
        }

        const items = response.data ?? [];
        if (!isMounted) {
          return;
        }

        setAllNewsItems(items);
        setIsFallback(false);
      } catch {
        if (!isMounted) {
          return;
        }

        setAllNewsItems(getMockNewsList());
        setIsFallback(true);
        setErrorMessage(
          'No se pudo cargar el listado en tiempo real. Mostramos contenido de respaldo temporal.',
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadNews();

    return () => {
      isMounted = false;
    };
  }, []);

  const listState: NewsListState = useMemo(
    () =>
      buildNewsListState({
        items: allNewsItems,
        page: currentPage,
        pageSize: PAGE_SIZE,
        isFallback,
      }),
    [allNewsItems, currentPage, isFallback],
  );

  useEffect(() => {
    if (listState.totalPages > 0 && currentPage > listState.totalPages) {
      setSearchParams({ page: String(listState.totalPages) }, { replace: true });
    }
  }, [currentPage, listState.totalPages, setSearchParams]);

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > Math.max(listState.totalPages, 1)) {
      return;
    }

    if (nextPage === currentPage) {
      return;
    }

    setSearchParams({ page: String(nextPage) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="news-list-page section-padding reveal-up">
      <div className="container">
        <header className="news-list-page__header text-center">
          <h1 className="news-list-page__title">Noticias</h1>
          <p className="news-list-page__subtitle">
            Últimas publicaciones de Equipo PUCH para seguir de cerca nuestras
            acciones y avances.
          </p>
        </header>

        {errorMessage && (
          <div className="alert alert-warning news-list-page__alert" role="status">
            {errorMessage}
          </div>
        )}

        {isLoading ? (
          <div className="news-list-page__state" role="status" aria-live="polite">
            <div className="spinner-border text-secondary" role="presentation" />
            <p>Cargando noticias...</p>
          </div>
        ) : listState.total === 0 ? (
          <div className="news-list-page__state news-list-page__state--empty">
            <i className="bi bi-newspaper" aria-hidden="true" />
            <p>Próximamente publicaremos nuevas noticias.</p>
          </div>
        ) : (
          <>
            {listState.isFallback && (
              <p className="news-list-page__fallback-note">
                Mostrando datos de respaldo temporal.
              </p>
            )}

            <NewsGrid items={listState.items} variant="list" />

            <NewsPagination
              currentPage={listState.page}
              totalPages={listState.totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </section>
  );
};

function sanitizePage(rawPage: string | null): number {
  const parsedPage = Number(rawPage);

  if (!Number.isInteger(parsedPage) || parsedPage < 1) {
    return 1;
  }

  return parsedPage;
}
