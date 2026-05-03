const API_URL = import.meta.env.VITE_API_URL || '';

export function getAuthToken() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('token');
}

export function setAuthToken(token) {
  if (typeof window === 'undefined') return;

  if (token) {
    window.localStorage.setItem('token', token);
  } else {
    window.localStorage.removeItem('token');
  }
}

export default function apiFetch(url, options = {}) {
  const token = getAuthToken();
  const isAbsolute = /^https?:\/\//i.test(url);
  const targetUrl = isAbsolute ? url : `${API_URL}${url}`;

  return fetch(targetUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
}
