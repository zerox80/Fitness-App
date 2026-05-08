import React, { createContext, useContext, useState, useEffect } from 'react';
import { ApiError, api, setToken as setApiToken } from './api';
import { getToken, setToken, removeToken } from './storage';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function isUnauthorizedError(error: unknown) {
  return error instanceof ApiError && (error.status === 401 || error.status === 403);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      const token = await getToken();
      if (token) {
        setApiToken(token);
        const me = await api.auth.me();
        setUser(me);
      }
    } catch (error) {
      if (isUnauthorizedError(error)) {
        await removeToken();
        setApiToken(null);
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const res = await api.auth.login({ email, password });
    await setToken(res.token);
    setApiToken(res.token);
    setUser(res.user);
  }

  async function register(email: string, name: string, password: string) {
    const res = await api.auth.register({ email, name, password });
    await setToken(res.token);
    setApiToken(res.token);
    setUser(res.user);
  }

  async function logout() {
    try {
      await removeToken();
    } finally {
      setApiToken(null);
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
