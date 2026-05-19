export type PublicRegionApiItem = {
  id: number;
  name: string;
  address: string;
  email: string;
  phone: string | null;
};

export type HumanBookApiItem = {
  id: number;
  name: string;
  title: string;
  slug: string;
  pdfUrl: string;
  pdfOriginalName: string;
  region: {
    id: number;
    name: string;
  };
};

export type DelegationTab = {
  id: number;
  label: string;
  slug: string;
};

export type DelegationContactView = {
  id: number;
  label: string;
  address: string;
  email: string;
  phone: string | null;
  mapQuery: string;
};

export type HumanBookCardView = {
  id: number;
  name: string;
  title: string;
  summary: string;
  slug: string;
  pdfOriginalName: string;
  downloadUrl: string;
};
