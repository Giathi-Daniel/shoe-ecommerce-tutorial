import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await fetch('/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed to fetch user');

        const data = await res.json();
        setUser(data);
      } catch {
        setUser(null);
        localStorage.removeItem('token');
      }
    };

    fetchUser();
  }, [navigate]);

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/'); 
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'GET',
        credentials: 'include', 
      });

      if (!res.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.error(err);
      setUser(null); // fallback
    }
  };


  return (
    <AuthContext.Provider value={{ user, useAuth, setUser, logout, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  );
}