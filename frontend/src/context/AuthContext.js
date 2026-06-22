import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  // Keep localStorage in sync with state
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', user.token);
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, [user]);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setUser(data);
    return data;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    // Don't set user — account is pending approval
    return data;
  }, []);

  const changePassword = useCallback(async (email, currentPassword, newPassword) => {
    const { data } = await api.post('/auth/change-password', { email, currentPassword, newPassword });
    setUser(data);
    return data;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/auth/me');
      // Keep the token from the current user state
      setUser((prev) => ({ ...data, token: prev?.token }));
    } catch {
      // Token invalid — logout
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const isAuthenticated = !!user?.token;
  const isManager = () => user?.role === 'erp_manager';
  const isAdmin = () => user?.role === 'admin';
  const isUser = () => user?.role === 'user';
  const hasRole = (...roles) => roles.includes(user?.role);

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
    changePassword,
    isManager,
    isAdmin,
    isUser,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
