export type AdminNewsStatus = 'DRAFT' | 'PUBLISHED' | 'HIDDEN';

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

export type CreateAdminNewsPayload = {
  title: string;
  excerpt: string;
  content: string;
  imageUrl?: string;
  status?: AdminNewsStatus;
};

export type UpdateAdminNewsPayload = Partial<CreateAdminNewsPayload> & {
  id: number;
};

export type AdminNewsFormData = {
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  status: AdminNewsStatus;
};
