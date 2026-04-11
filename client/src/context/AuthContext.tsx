import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('braingames_token');
    const savedUser = localStorage.getItem('braingames_user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        // Refresh star counts from DB
        fetch('/api/auth/me', {
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

  const login = async (username, password) => {
    const response = await fetch('/api/auth/login', {
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

  const register = async (username, password) => {
    const response = await fetch('/api/auth/register', {
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

  const updateUser = (fields) => {
    setUser((prev) => {
      const updated = { ...prev, ...fields };
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
