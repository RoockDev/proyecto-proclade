import type { NewsApiItem, NewsItem, NewsListState } from '../types/news.types';
import { resolveUploadUrl } from '../../../services/http/api.constants';

const DEFAULT_CATEGORY = 'Noticias';

// Convierte un objeto de noticia recibido desde la API al modelo que usa la UI.
export function mapNewsApiItem(item: NewsApiItem): NewsItem {
  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    excerpt: item.excerpt,
    content: item.content,
    imageUrl: resolveUploadUrl(item.imageUrl ?? null),
    status: item.status,
    publishedAt: item.publishedAt ?? null,
    createdAt: item.createdAt,
    category: DEFAULT_CATEGORY,
  };
}

// Ordena las noticias de más reciente a más antigua usando publishedAt y fallback en createdAt.
export function sortNewsByPublishedAtDesc(items: NewsItem[]): NewsItem[] {
  return [...items].sort((a, b) => {
    const aTimestamp = resolveTimestamp(a);
    const bTimestamp = resolveTimestamp(b);

    return bTimestamp - aTimestamp;
  });
}

// Aplica la normalización general de colecciones de noticias antes de pintar en UI.
export function normalizeNewsCollection(items: NewsItem[]): NewsItem[] {
  return sortNewsByPublishedAtDesc(items);
}

// Formatea fechas para mostrar en español y controla casos sin fecha válida.
export function formatNewsDate(date: string | null): string {
  if (!date) {
    return 'Fecha por confirmar';
  }

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    return 'Fecha por confirmar';
  }

  return parsedDate.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Construye el estado de paginación cliente con total, páginas y elementos de la página actual.
export function buildNewsListState(params: {
  items: NewsItem[];
  page: number;
  pageSize: number;
}): NewsListState {
  const { items, page, pageSize } = params;
  const total = items.length;
  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);
  const boundedPage = totalPages === 0 ? 1 : Math.min(page, totalPages);
  const start = (boundedPage - 1) * pageSize;
  const pagedItems = items.slice(start, start + pageSize);

  return {
    items: pagedItems,
    page: boundedPage,
    pageSize,
    total,
    totalPages,
  };
}

// Resuelve un timestamp seguro para ordenar por fecha sin romper cuando faltan campos.
function resolveTimestamp(item: NewsItem): number {
  const publishedAtTimestamp = item.publishedAt ? Date.parse(item.publishedAt) : NaN;
  if (!Number.isNaN(publishedAtTimestamp)) {
    return publishedAtTimestamp;
  }

  const createdAtTimestamp = Date.parse(item.createdAt);
  return Number.isNaN(createdAtTimestamp) ? 0 : createdAtTimestamp;
}
