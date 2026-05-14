import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getNewsBySlug } from '../../api/news.api';
import type { NewsItem } from '../../types/news.types';
import { formatNewsDate } from '../../utils/news.mapper';
import './NewsDetailPage.css';

export const NewsDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadNewsDetail = async () => {
      if (!slug) {
        setIsLoading(false);
        setIsNotFound(true);
        return;
      }

      try {
        setIsLoading(true);
        setWarningMessage(null);
        setIsNotFound(false);
        setImageError(false);

        const response = await getNewsBySlug(slug);

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Noticia no encontrada.');
        }

        if (!isMounted) {
          return;
        }

        setNewsItem(response.data);
      } catch {
        if (!isMounted) {
          return;
        }

        setNewsItem(null);
        setWarningMessage('No se pudo cargar la noticia solicitada.');
        setIsNotFound(true);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadNewsDetail();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const contentParagraphs = useMemo(() => {
    if (!newsItem) {
      return [];
    }

    return newsItem.content
      .split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
  }, [newsItem]);

  if (isLoading) {
    return (
      <section className="news-detail-page section-padding reveal-up">
        <div className="container">
          <div className="news-detail-page__state" role="status" aria-live="polite">
            <div className="spinner-border text-secondary" role="presentation" />
            <p>Cargando detalle de la noticia...</p>
          </div>
        </div>
      </section>
    );
  }

  if (isNotFound || !newsItem) {
    return (
      <section className="news-detail-page section-padding reveal-up">
        <div className="container">
          <div className="news-detail-page__state news-detail-page__state--empty">
            <i className="bi bi-file-earmark-x" aria-hidden="true" />
            <h1>Noticia no encontrada</h1>
            <p>La noticia que buscas no existe o no está disponible en este momento.</p>
            <Link to="/noticias" className="btn btn-brand-outline">
              Volver al listado
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const hasImage = Boolean(newsItem.imageUrl) && !imageError;

  return (
    <section className="news-detail-page section-padding reveal-up">
      <div className="container">
        <div className="news-detail-page__head">
          <Link to="/noticias" className="news-detail-page__back-link">
            <i className="bi bi-arrow-left" /> Volver a noticias
          </Link>

          {warningMessage && (
            <div className="alert alert-warning news-detail-page__alert" role="status">
              {warningMessage}
            </div>
          )}

          <span className="news-detail-page__category">{newsItem.category}</span>
          <h1 className="news-detail-page__title">{newsItem.title}</h1>
          <p className="news-detail-page__date">{formatNewsDate(newsItem.publishedAt)}</p>
        </div>

        <article className="news-detail-page__article">
          <div className="news-detail-page__media">
            {hasImage ? (
              <img
                src={newsItem.imageUrl ?? ''}
                alt={newsItem.title}
                className="news-detail-page__image"
                loading="lazy"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="news-detail-page__placeholder" role="img" aria-label="Imagen no disponible">
                <i className="bi bi-image" />
                <span>Imagen en actualización</span>
              </div>
            )}
          </div>

          <div className="news-detail-page__content">
            {contentParagraphs.map((paragraph, index) => (
              <p key={`${newsItem.id}-paragraph-${index}`}>{paragraph}</p>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
};
