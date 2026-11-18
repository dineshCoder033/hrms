import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, fetchMeApi, logoutApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('taskorbit_token'));
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('taskorbit_token');
      if (savedToken) {
        try {
          const userData = await fetchMeApi();
          setUser(userData);
          setToken(savedToken);
        } catch (err) {
          console.warn('Session expired or invalid token:', err.message);
          localStorage.removeItem('taskorbit_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const data = await loginApi({ email, password });
    localStorage.setItem('taskorbit_token', data.accessToken);
    setToken(data.accessToken);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('taskorbit_token');
      setToken(null);
      setUser(null);
    }
  };

  const updateUser = (newUserData) => {
    setUser(prev => ({ ...prev, ...newUserData }));
  };

  const value = {
    user,
    setUser,
    updateUser,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
