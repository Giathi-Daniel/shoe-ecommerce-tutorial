export default async function fetchWithCsrf(url, options = {}) {
  try {
    let csrfToken = localStorage.getItem('csrfToken');

    // Only fetch a new token if one doesn't already exist
    if (!csrfToken) {
      const csrfRes = await fetch('/api/csrf-token', {
        credentials: 'include', // receive the csrfToken cookie
      });

      const csrfData = await csrfRes.json();

      if (!csrfRes.ok || !csrfData.csrfToken) {
        throw new Error('Failed to retrieve CSRF token');
      }

      csrfToken = csrfData.csrfToken;
      localStorage.setItem('csrfToken', csrfToken);
    }

    // Merge headers (and allow overriding)
    const headers = {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
      ...(options.headers || {}),
    };

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // include cookies 
    });

    // If 403, assume CSRF failed — clear token and log for debugging
    if (response.status === 403) {
      console.warn('CSRF token rejected, clearing cached token.');
      localStorage.removeItem('csrfToken');
    }

    return response;
  } catch (error) {
    console.error('fetchWithCsrf error:', error);
    throw error;
  }
}