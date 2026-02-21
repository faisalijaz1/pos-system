import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { authApi } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  const login = useCallback(async (username, password) => {
    const { data } = await authApi.login(username, password);
    localStorage.setItem('token', data.token);
    const userData = {
      username: data.username,
      role: data.role,
    };
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(data.token);
    setUser(userData);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then(() => setLoading(false))
      .catch(() => {
        logout();
        setLoading(false);
      });
  }, [token, logout]);

  const hasRole = useCallback(
    (...roles) => {
      if (!user?.role) return false;
      const r = user.role.toUpperCase();
      return roles.some((role) => r === role.toUpperCase());
    },
    [user]
  );

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!token,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
