import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiFetch, { getAuthToken, setAuthToken } from '../utils/apiFetch.jsx';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const clearSession = useCallback(() => {
    setAuthToken(null);
    setUser(null);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout request failed:', err);
    }
    clearSession();
    navigate('/');
  }, [clearSession, navigate]);

  const fetchProfile = useCallback(async () => {
    if (!getAuthToken()) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await apiFetch('/api/auth/profile');
      if (res.status === 401 || res.status === 403 || res.status === 404) {
        clearSession();
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch user profile');
      setUser(await res.json());
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }, [clearSession]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const afterLogin = useCallback(async (token) => {
    setAuthToken(token);
    try {
      await fetchProfile();
    } catch {
      toast.error('Failed to initialize session');
    }
  }, [fetchProfile]);

  const value = useMemo(
    () => ({ user, loading, isAdmin: user?.role === 'admin', setUser, logout, fetchProfile, afterLogin }),
    [user, loading, logout, fetchProfile, afterLogin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
