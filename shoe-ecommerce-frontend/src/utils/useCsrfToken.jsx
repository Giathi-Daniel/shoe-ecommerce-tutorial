import { useEffect } from 'react';

export const useCsrfToken = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const initCsrfToken = async () => {
      try {
        const res = await fetch(`${API_URL}/api/csrf-token`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (data.csrfToken) {
          localStorage.setItem('csrfToken', data.csrfToken);
        } else {
          console.warn('No CSRF token returned from server');
        }
      } catch (err) {
        console.error('Failed to initialize CSRF token:', err);
      }
    };

    initCsrfToken();
  }, [API_URL]);
};