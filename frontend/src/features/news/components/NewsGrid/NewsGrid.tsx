import { NewsCard } from '../NewsCard/NewsCard';
import type { NewsCardVariant, NewsItem } from '../../types/news.types';

type NewsGridProps = {
  items: NewsItem[];
  variant: NewsCardVariant;
};

export const NewsGrid = ({ items, variant }: NewsGridProps) => {
  const columnClass =
    variant === 'home' ? 'col-12 col-md-6 col-lg-4' : 'col-12 col-sm-6 col-lg-4';

  return (
    <div className="row g-4">
      {items.map((item) => (
        <div className={`${columnClass} d-flex`} key={item.id}>
          <NewsCard news={item} variant={variant} />
        </div>
      ))}
    </div>
  );
};
