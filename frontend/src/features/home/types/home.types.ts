export type MissionCard = {
  title: string;
  description: string;
  icon: string;
};

export type SuperheroPreview = {
  id: string;
  name: string;
  speech: string;
  imageKey: string;
};

export type HomeCountryProjectId =
  | 'india'
  | 'burkina-faso'
  | 'haiti-republica-dominicana';

export type HomeCountryProject = {
  id: HomeCountryProjectId;
  countryLabel: string;
  title: string;
  description: string;
  imageUrl: string | null;
  imageAlt: string;
};

export type HomeJoinReason = {
  id: string;
  text: string;
};

export type HomeCounter = {
  value: number;
  label: string;
  suffix?: string;
};

export type HomeNewsPreview = {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  category: string;
  imageUrl: string | null;
  imageAlt: string;
  to: string;
};

export type StatItem = {
  label: string;
  value: string;
};

export type NewsItem = {
  id: string;
  title: string;
  date: string;
  tag: string;
  excerpt: string;
  image: string;
  to: string;
};
