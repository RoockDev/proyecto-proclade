export type AdminHumanBook = {
  id: number;
  name: string;
  title: string;
  slug: string;
  regionId: number;
  pdfUrl: string;
  pdfOriginalName: string;
  pdfMimeType: string;
  pdfSize: number;
  createdById: number;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  region: {
    id: number;
    name: string;
  };
};

export type RegionOption = {
  id: number;
  name: string;
};

export type CreateHumanBookPayload = {
  name: string;
  title: string;
  regionId: number;
  pdf: File;
};

export type UpdateHumanBookPayload = {
  id: number;
  name?: string;
  title?: string;
  regionId?: number;
  pdf?: File;
};

export type HumanBookFormData = {
  name: string;
  title: string;
  regionId: string;
  pdf: File | null;
};
