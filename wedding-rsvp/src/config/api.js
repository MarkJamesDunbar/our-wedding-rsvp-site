const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export function apiPath(path) {
  if (!path.startsWith('/')) {
    throw new Error(`Expected API path to start with '/': ${path}`);
  }

  return API_BASE_URL ? `${API_BASE_URL}${path}` : path;
}
