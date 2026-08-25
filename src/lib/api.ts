const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('hadara_access_token');
}

function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('hadara_refresh_token');
}

export function setTokens(accessToken: string, refreshToken?: string) {
  window.localStorage.setItem('hadara_access_token', accessToken);
  if (refreshToken) window.localStorage.setItem('hadara_refresh_token', refreshToken);
}

export function clearTokens() {
  window.localStorage.removeItem('hadara_access_token');
  window.localStorage.removeItem('hadara_refresh_token');
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  auth?: boolean;
}

async function rawFetch(path: string, options: RequestOptions, token: string | null) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  return fetch(`${API_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: 'no-store',
  });
}

// Rafraichit automatiquement le token d'acces expire (401) avant de reessayer une fois.
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = false } = options;
  let res = await rawFetch(path, options, auth ? getAccessToken() : null);

  if (res.status === 401 && auth) {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        setTokens(data.accessToken, data.refreshToken);
        res = await rawFetch(path, options, data.accessToken);
      } else {
        clearTokens();
      }
    }
  }

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.message ?? `Erreur API (${res.status})`);
  }

  return res.json();
}

// --- Auth ---
export const login = (email: string, password: string) =>
  apiFetch<{ accessToken: string; refreshToken: string; user: { id: string; email: string; role: string } }>(
    '/auth/login',
    { method: 'POST', body: { email, password } },
  );

export const register = (payload: { email: string; password: string; fullName: string; phone?: string }) =>
  apiFetch<{ accessToken: string; refreshToken: string; user: { id: string; email: string; role: string } }>(
    '/auth/register',
    { method: 'POST', body: payload },
  );

// --- Events ---
export const getEvents = () => apiFetch<any[]>('/events');

// --- Locations (Smart Guide) ---
export const getLocations = (category?: string) =>
  apiFetch<any[]>(`/locations${category ? `?category=${category}` : ''}`);

// --- Incidents (Urgence) ---
export const createIncident = (payload: {
  type: string;
  latitude: number;
  longitude: number;
  description?: string;
}) => apiFetch('/incidents', { method: 'POST', body: payload, auth: true });

export const getIncidents = (status?: string) =>
  apiFetch<any[]>(`/incidents${status ? `?status=${status}` : ''}`, { auth: true });

// --- Chatbot ---
export const askChatbot = (question: string, language: 'fr' | 'wo' | 'ar') =>
  apiFetch<{ answer: string; language: string }>('/chatbot/message', {
    method: 'POST',
    body: { question, language },
  });

// --- Green Hadara ---
export const getWasteLeaderboard = () => apiFetch<any[]>('/green/leaderboard');

export const createWasteReport = (payload: {
  photoUrl: string;
  latitude: number;
  longitude: number;
  neighborhood?: string;
}) => apiFetch('/green/waste-reports', { method: 'POST', body: payload, auth: true });

// --- Uploads (Cloudinary, via l'API) ---
export async function uploadImage(file: File): Promise<{ url: string; publicId: string }> {
  const token = getAccessToken();
  const form = new FormData();
  form.append('file', file);

  const res = await fetch(`${API_URL}/uploads/image`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: form,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody.message ?? "Echec de l'upload de l'image.");
  }
  return res.json();
}
