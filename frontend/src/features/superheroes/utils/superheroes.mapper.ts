import type {
  SuperheroApiItem,
  SuperheroItem,
} from '../types/superheroes.types';
import { resolveUploadUrl } from '../../../services/http/api.constants';

export function mapSuperheroApiItem(item: SuperheroApiItem): SuperheroItem {
  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    description: item.description,
    quote: item.quote ?? null,
    country: item.country ?? null,
    imageUrl: resolveUploadUrl(item.imageUrl ?? null),
    sortOrder: item.sortOrder,
    status: item.status,
    createdAt: item.createdAt,
  };
}

export function normalizeSuperheroCollection(items: SuperheroApiItem[]): SuperheroItem[] {
  return [...items]
    .map(mapSuperheroApiItem)
    .sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder;
      }

      const aTimestamp = resolveTimestamp(a.createdAt);
      const bTimestamp = resolveTimestamp(b.createdAt);

      return bTimestamp - aTimestamp;
    });
}

function resolveTimestamp(value: string): number {
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}
