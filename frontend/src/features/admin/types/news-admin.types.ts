export type AdminNewsStatus = 'DRAFT' | 'PUBLISHED';

export type AdminNewsItem = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrl: string | null;
  status: AdminNewsStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdById: number;
};
