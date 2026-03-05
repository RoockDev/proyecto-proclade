import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { NewsCardVariant, NewsItem } from '../../types/news.types';
import { formatNewsDate } from '../../utils/news.mapper';
import './NewsCard.css';

type NewsCardProps = {
  news: NewsItem;
  variant: NewsCardVariant;
};

export const NewsCard = ({ news, variant }: NewsCardProps) => {
  const [imageError, setImageError] = useState(false);

  const hasImage = Boolean(news.imageUrl) && !imageError;
  const detailPath = `/noticias/${news.slug}`;

  return (
    <article className={`news-card news-card--${variant} h-100`}>
      <div className="news-card__media">
        {hasImage ? (
          <img
            src={news.imageUrl ?? ''}
            alt={news.title}
            className="news-card__image"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="news-card__placeholder" role="img" aria-label="Imagen no disponible">
            <i className="bi bi-image" />
            <span>Imagen en actualización</span>
          </div>
        )}
      </div>

      <div className="news-card__body d-flex flex-column">
        <div className="news-card__meta">
          <span className="news-card__category">{news.category}</span>
          <time className="news-card__date" dateTime={news.publishedAt ?? news.createdAt}>
            {formatNewsDate(news.publishedAt)}
          </time>
        </div>

        <h3 className="news-card__title">{news.title}</h3>
        <p className={`news-card__excerpt ${variant === 'home' ? 'news-card__excerpt--clamp' : ''}`}>
          {news.excerpt}
        </p>

        <Link to={detailPath} className="news-card__link mt-auto">
          Leer más <i className="bi bi-arrow-right" />
        </Link>
      </div>
    </article>
  );
};
