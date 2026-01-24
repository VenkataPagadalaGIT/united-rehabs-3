import { useState, useEffect, useCallback } from "react";
import { authApi } from "@/lib/api";

interface User {
  id: string;
  email: string;
  role: string;
  mfa_enabled?: boolean;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setUser(null);
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    try {
      const userData = await authApi.getMe();
      setUser(userData);
      setIsAdmin(userData.role === 'admin');
    } catch (error) {
      // Token invalid or expired
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      localStorage.setItem('auth_token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
      setIsAdmin(response.user.role === 'admin');
      return { error: null };
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Login failed';
      return { error: { message } };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const response = await authApi.register(email, password);
      localStorage.setItem('auth_token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
      setIsAdmin(response.user.role === 'admin');
      return { error: null };
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Registration failed';
      return { error: { message } };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAdmin(false);
    return { error: null };
  };

  return {
    user,
    session: user ? { user, access_token: localStorage.getItem('auth_token') } : null,
    isAdmin,
    loading,
    signIn,
    signUp,
    signOut,
  };
};
