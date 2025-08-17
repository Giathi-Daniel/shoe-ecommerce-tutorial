let csrfToken = null;

export default async function fetchWithCsrf(url, options = {}) {
  async function getCsrfToken() {
    const csrfRes = await fetch('/api/csrf-token', {
      credentials: 'include',
    });

    if (!csrfRes.ok) throw new Error('Failed to fetch CSRF token');
    const { csrfToken } = await csrfRes.json();
    return csrfToken;
  }

  try {
    // fetch token if missing
    if (!csrfToken) {
      csrfToken = await getCsrfToken();
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken,
        ...(options.headers || {}),
      },
      credentials: 'include',
    });

    // If backend rejects CSRF → refresh & retry ONCE
    if (response.status === 403) {
      console.warn('CSRF rejected, refreshing token...');
      csrfToken = await getCsrfToken();

      return fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
          ...(options.headers || {}),
        },
        credentials: 'include',
      });
    }

    return response;
  } catch (error) {
    console.error('fetchWithCsrf error:', error);
    throw error;
  }
}