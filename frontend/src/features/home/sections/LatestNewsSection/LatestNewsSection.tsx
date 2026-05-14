import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getLatestNews } from '../../../news/api/news.api';
import { NewsGrid } from '../../../news/components/NewsGrid/NewsGrid';
import type { NewsItem } from '../../../news/types/news.types';
import './LatestNewsSection.css';

const HOME_NEWS_LIMIT = 3;

export const LatestNewsSection = () => {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadLatestNews = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const response = await getLatestNews(HOME_NEWS_LIMIT);

        if (!response.success) {
          throw new Error(response.message || 'No se pudieron cargar las noticias.');
        }

        if (!isMounted) {
          return;
        }

        setItems(response.data ?? []);
      } catch {
        if (!isMounted) {
          return;
        }

        setItems([]);
        setErrorMessage(
          'No se pudieron cargar las noticias. Inténtalo de nuevo más tarde.',
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadLatestNews();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="home-news section-padding reveal-up reveal-delay-5">
      <div className="container">
        <div className="text-center mb-5">
          <h2 className="home-news__title">Últimas noticias</h2>
          <p className="home-news__subtitle">
            Mantente al día de nuestras actividades y avances.
          </p>
        </div>

        {errorMessage && (
          <div className="alert alert-warning home-news__alert" role="status">
            {errorMessage}
          </div>
        )}

        {isLoading ? (
          <div className="home-news__state" role="status" aria-live="polite">
            <div className="spinner-border text-secondary" role="presentation" />
            <p>Cargando noticias...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="home-news__state home-news__state--empty">
            <i className="bi bi-newspaper" aria-hidden="true" />
            <p>Próximamente compartiremos nuevas noticias en esta sección.</p>
          </div>
        ) : (
          <NewsGrid items={items} variant="home" />
        )}

        <div className="text-center mt-4">
          <Link to="/noticias?page=1" className="btn btn-brand-gradient">
            Ver todas las noticias <i className="bi bi-arrow-right ms-2" />
          </Link>
        </div>
      </div>
    </section>
  );
};
