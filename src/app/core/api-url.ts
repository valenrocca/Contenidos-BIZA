import { environment } from '../../environments/environment';

/** Resolves /api paths for local dev (direct to API) or production (same-origin). */
export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const base = environment.apiBaseUrl.replace(/\/$/, '');
  return base ? `${base}${normalizedPath}` : normalizedPath;
}
