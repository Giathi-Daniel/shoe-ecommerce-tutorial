import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiFetch, { getAuthToken, setAuthToken } from '../utils/apiFetch.jsx';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // --- Logout function ---
  const logout = useCallback(async () => {
    try {
      await apiFetch('/api/auth/logout', {
        method: 'POST',
      });
    } catch (err) {
      console.error('Logout failed:', err);
    }

    setAuthToken(null);
    setUser(null);
    navigate('/');
  }, [navigate]);

  // --- Fetch the user profile ---
  const fetchProfile = useCallback(async () => {
    if (!getAuthToken()) {
      setUser(null);
      return;
    }

    try {
      const res = await apiFetch('/api/auth/profile', {
        method: 'GET',
      });

      if (res.status === 401 || res.status === 403) {
        throw new Error('Session expired');
      }

      if (!res.ok) throw new Error('Failed to fetch user profile');

      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.error('Error fetching profile:', err);
      logout(); 
    }
  }, [logout]);


  // --- On mount: check auth ---
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const afterLogin = async (token) => {
    try {
      setAuthToken(token);
      await fetchProfile();
    } catch (error) {
      console.error('Error during afterLogin:', error);
      toast.error('Failed to initialize session')
    }
  };



  return (
    <AuthContext.Provider value={{ user, setUser, logout, fetchProfile, afterLogin }}>
      {children}
    </AuthContext.Provider>
  );
}
