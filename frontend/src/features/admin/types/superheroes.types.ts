export type SuperheroStatus = 'DRAFT' | 'PUBLISHED' | 'HIDDEN';

export type AdminSuperheroRow = {
  id: number;
  name: string;
  slug: string;
  description: string;
  quote?: string | null;
  country?: string | null;
  imageUrl?: string | null;
  sortOrder: number;
  status: SuperheroStatus;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminSuperheroesListData = {
  items: AdminSuperheroRow[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type AdminSuperheroesListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: SuperheroStatus;
  deleted?: boolean;
};

export type CreateSuperheroPayload = {
  name: string;
  description: string;
  quote?: string;
  country?: string;
  sortOrder?: number;
  status?: SuperheroStatus;
  image?: File | null;
};

export type UpdateSuperheroPayload = Partial<CreateSuperheroPayload> & {
  id: number;
};

export type UpdateSuperheroStatusPayload = {
  id: number;
  status: SuperheroStatus;
};
