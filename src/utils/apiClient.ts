import { auth } from '../config/firebase';

/**
 * Enterprise authenticated fetch wrapper for CampusOS.
 * Retrieves current Firebase ID token (or HMAC elevation token) and appends
 * the Authorization: Bearer header to outgoing API requests.
 */
export async function authenticatedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers || {});

  let token: string | null = null;

  try {
    if (auth.currentUser) {
      token = await auth.currentUser.getIdToken();
    }
  } catch (err) {
    console.warn('Failed to retrieve Firebase ID token:', err);
  }

  if (!token) {
    token = localStorage.getItem('campusos_elevation_token');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(input, {
    ...init,
    headers,
  });
}
