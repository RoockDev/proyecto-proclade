const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '');

export function resolveUploadUrl(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  let sanitized = value;
  if (sanitized.startsWith('/api/uploads')) {
    sanitized = sanitized.replace('/api/uploads', '/uploads');
  }

  const normalizedPath = sanitized.startsWith('/') ? sanitized : `/${sanitized}`;
  return `${API_BASE_URL}${normalizedPath}`;
}
