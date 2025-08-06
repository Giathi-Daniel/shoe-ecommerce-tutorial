export default async function fetchWithCsrf(url, options = {}) {
  try {
    const csrfRes = await fetch('/api/csrf-token', {
      credentials: 'include',
    });

    const csrfData = await csrfRes.json();
    const csrfToken = csrfData.csrfToken;

    if (!csrfToken) throw new Error('Failed to retrieve CSRF token');

    // Prepare headers
    const headers = {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken,
      ...options.headers,
    };

    // Execute the actual fetch with the CSRF token and credentials
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // ensures cookies are sent
    });

    if (response.status === 403) {
      console.error('CSRF protection triggered');
    }

    return response;
  } catch (error) {
    console.error('fetchWithCsrf error:', error);
    throw error;
  }
}
