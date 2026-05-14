export type MissionCard = {
  title: string;
  description: string;
  icon: string;
};

export type HomeCountryProjectId =
  | "india"
  | "burkina-faso"
  | "haiti-republica-dominicana";

export type HomeCountryProject = {
  id: HomeCountryProjectId;
  countryLabel: string;
  title: string;
  description: string;
  imageUrl: string | null;
  imageAlt: string;
  imagePendingLabel?: string;
  imagePendingTitle?: string;
  imagePendingDescription?: string;
};

export type HomeJoinReason = {
  id: string;
  text: string;
};

export type HomeCounter = {
  value: number | string;
  label: string;
  suffix?: string;
};

export type StatItem = {
  label: string;
  value: string;
};
