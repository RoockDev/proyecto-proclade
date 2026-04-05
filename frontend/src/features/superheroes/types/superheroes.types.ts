export type SuperheroStatus = 'DRAFT' | 'PUBLISHED' | 'HIDDEN';

export type SuperheroApiItem = {
  id: number;
  name: string;
  slug: string;
  description: string;
  quote?: string | null;
  country?: string | null;
  imageUrl?: string | null;
  sortOrder: number;
  status: SuperheroStatus;
  createdAt: string;
};

export type SuperheroItem = {
  id: number;
  name: string;
  slug: string;
  description: string;
  quote: string | null;
  country: string | null;
  imageUrl: string | null;
  sortOrder: number;
  status: SuperheroStatus;
  createdAt: string;
};

export type SuperheroListApiData = {
  items: SuperheroItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type SuperheroListState = {
  items: SuperheroItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  isFallback: boolean;
};
