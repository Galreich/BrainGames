import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiUrl } from '../utils/api';

export type AuthUser = {
  id: number;
  username: string;
  is_admin: boolean;
  red_stars: number;
  blue_stars: number;
  green_stars: number;
};

type AuthContextType = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ token: string; user: AuthUser }>;
  register: (username: string, password: string) => Promise<{ token: string; user: AuthUser }>;
  logout: () => void;
  updateUser: (fields: Partial<AuthUser>) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('braingames_token');
    const savedUser = localStorage.getItem('braingames_user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        // Refresh star counts from DB
        fetch(apiUrl('/api/auth/me'), {
          headers: { Authorization: `Bearer ${savedToken}` },
        })
          .then((r) => r.ok ? r.json() : null)
          .then((data) => {
            if (data) {
              setUser(data);
              localStorage.setItem('braingames_user', JSON.stringify(data));
            }
          })
          .catch(() => {})
          .finally(() => setLoading(false));
        return;
      } catch (e) {
        localStorage.removeItem('braingames_token');
        localStorage.removeItem('braingames_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const response = await fetch(apiUrl('/api/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login_error');
    }

    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('braingames_token', data.token);
    localStorage.setItem('braingames_user', JSON.stringify(data.user));

    return data;
  };

  const register = async (username: string, password: string) => {
    const response = await fetch(apiUrl('/api/auth/register'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Register_error');
    }

    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('braingames_token', data.token);
    localStorage.setItem('braingames_user', JSON.stringify(data.user));

    return data;
  };

  const updateUser = (fields: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated: AuthUser = { ...prev, ...fields };
      localStorage.setItem('braingames_user', JSON.stringify(updated));
      return updated;
    });
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('braingames_token');
    localStorage.removeItem('braingames_user');
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
