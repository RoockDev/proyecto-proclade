export type NewsStatus = 'DRAFT' | 'PUBLISHED';

export type NewsItem = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrl: string | null;
  status: NewsStatus;
  publishedAt: string | null;
  createdAt: string;
  category: string;
};

export type NewsApiItem = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrl?: string | null;
  status: NewsStatus;
  publishedAt?: string | null;
  createdAt: string;
};

export type NewsCardVariant = 'home' | 'list';

export type NewsListState = {
  items: NewsItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  isFallback: boolean;
};
