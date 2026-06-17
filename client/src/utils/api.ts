export const API_BASE = 'https://braingames-server.vercel.app';

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}
