const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '');
const BOOKINGS_BASE_PATH = '/api/bookings';

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export function getWebSocketUrl() {
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL;
  }

  const url = new URL(API_BASE_URL);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  url.pathname = '/ws-seat-updates';
  url.search = '';
  return url.toString();
}

export async function apiFetch(path, { method = 'GET', body, token, signal } = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw error;
    }
    throw new Error(`Unable to reach API at ${API_BASE_URL}. Start backend server and try again.`);
  }

  const raw = await response.text();
  const data = raw ? safeJsonParse(raw) : null;

  if (!response.ok) {
    throw new Error(data?.message || `Request failed with status ${response.status}`);
  }

  return data;
}

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return { message: value };
  }
}

export function fetchMyBookings({ token, signal } = {}) {
  return apiFetch(`${BOOKINGS_BASE_PATH}/my`, { token, signal });
}

export function cancelBookingById(bookingId, { token, signal } = {}) {
  return apiFetch(`${BOOKINGS_BASE_PATH}/${bookingId}/cancel`, {
    method: 'POST',
    token,
    signal,
  });
}
