import { formatNewsDate } from '../../../../news/utils/news.mapper';
import type { AdminNewsItem } from '../../../types/news-admin.types';
import { AdminDataTable, type AdminTableColumn } from '../../shared/AdminDataTable/AdminDataTable';
import { AdminStatusBadge } from '../../shared/AdminStatusBadge/AdminStatusBadge';
import './NewsTable.css';

type NewsTableProps = {
  news: AdminNewsItem[];
};

const statusBadgeForNews = (item: AdminNewsItem) =>
  item.status === 'PUBLISHED'
    ? { label: 'Publicado', status: 'PUBLICADO' as const }
    : { label: 'Borrador', status: 'PENDIENTE' as const };

const buildImageUrl = (imageUrl: string | null): string | null => {
  if (!imageUrl) {
    return null;
  }

  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  if (imageUrl.startsWith('/')) {
    return `${apiBaseUrl}${imageUrl}`;
  }

  return `${apiBaseUrl}/${imageUrl}`;
};

const NewsImageCell = ({ item }: { item: AdminNewsItem }) => {
  const src = buildImageUrl(item.imageUrl);

  if (!src) {
    return (
      <div className="news-table__thumb-placeholder" aria-label="Imagen no disponible">
        <i className="bi bi-image" aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={item.title}
      className="news-table__thumb"
      loading="lazy"
    />
  );
};

export const NewsTable = ({ news }: NewsTableProps) => {
  const columns: AdminTableColumn<AdminNewsItem>[] = [
    {
      key: 'image',
      header: 'Imagen',
      cell: (item: AdminNewsItem) => <NewsImageCell item={item} />,
    },
    {
      key: 'title',
      header: 'Título',
      cell: (item: AdminNewsItem) => (
        <div className="news-table__title-cell">
          <strong>{item.title}</strong>
          <span>{item.slug}</span>
        </div>
      ),
    },
    {
      key: 'excerpt',
      header: 'Resumen',
      cell: (item: AdminNewsItem) => (
        <p className="news-table__excerpt">{item.excerpt}</p>
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      cell: (item: AdminNewsItem) => <AdminStatusBadge {...statusBadgeForNews(item)} />,
    },
    {
      key: 'publishedAt',
      header: 'Publicación',
      cell: (item: AdminNewsItem) => (
        <time dateTime={item.publishedAt ?? item.createdAt}>
          {formatNewsDate(item.publishedAt)}
        </time>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Actualizada',
      cell: (item: AdminNewsItem) => (
        <time dateTime={item.updatedAt}>
          {new Date(item.updatedAt).toLocaleString('es-ES')}
        </time>
      ),
    },
  ];

  return (
    <div className="news-table">
      <AdminDataTable<AdminNewsItem>
        columns={columns}
        rows={news}
        getRowKey={(item) => item.id.toString()}
        emptyMessage="No hay noticias que coincidan con la búsqueda."
      />
    </div>
  );
};
