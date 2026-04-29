export const resolveHeroImageUrl = (raw?: string | null) => {
  if (!raw) {
    return undefined;
  }

  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    return raw;
  }

  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';
  return `${baseUrl}${raw}`;
};
