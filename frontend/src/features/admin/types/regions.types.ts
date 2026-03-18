export type AdminRegion = {
  id: number;
  name: string;
  address: string;
  email: string;
  booksCount: number;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateRegionPayload = {
  name: string;
  address: string;
  email: string;
};

export type UpdateRegionPayload = Partial<CreateRegionPayload> & {
  id: number;
};

export type RegionFormData = {
  name: string;
  address: string;
  email: string;
};
