import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // --- Centralized CSRF token setup ---
  const initCsrfToken = async () => {
    try {
      const res = await fetch('/api/csrf-token', {
        credentials: 'include',
      });
      const data = await res.json();

      if (data.csrfToken) {
        localStorage.setItem('csrfToken', data.csrfToken);
      } else {
        console.warn('CSRF token not found in response');
      }
    } catch (err) {
      console.error('Failed to initialize CSRF token:', err);
    }
  };

  // --- Fetch the user profile ---
  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      });

      if (res.status === 401 || res.status === 403) {
        throw new Error('Session expired');
      }

      if (!res.ok) throw new Error('Failed to fetch user profile');

      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      logout(); // force logout on token failure
    }
  };

  // --- Logout function ---
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('csrfToken');
    setUser(null);
    navigate('/');
    initCsrfToken(); // refresh CSRF after logout
  };

  // --- On mount: check auth + initialize CSRF ---
  useEffect(() => {
    const init = async () => {
      await initCsrfToken();
      await fetchProfile();
    };
    init();
  }, []);

  const afterLogin = async (token) => {
    localStorage.setItem('token', token);
    await initCsrfToken();  // refresh CSRF token after auth
    await fetchProfile();
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, fetchProfile, afterLogin }}>
      {children}
    </AuthContext.Provider>
  );
}