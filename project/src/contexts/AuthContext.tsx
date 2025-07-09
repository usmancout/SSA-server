import React, { createContext, useContext, useState, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: string;
  username: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  avatar?: string;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: { username: string; email: string; password: string }) => Promise<void>;
  googleLogin: (token: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  getProfile: () => Promise<void>;
  setUser: (user: User | null) => void;  // <-- NEW
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    const res = await axios.post('https://ssa-server-production.up.railway.app/api/auth/login', { email, password });
    const { token, user } = res.data;
    localStorage.setItem('token', token);
    setUser({ id: '1', ...user });
  };

  const signup = async (data: { username: string; email: string; password: string }) => {
    const res = await axios.post('https://ssa-server-production.up.railway.app/api/auth/signup', data);
    setUser({ id: '1', ...res.data.user });
  };

  // 👇 NEW Google login method
  const googleLogin = async (googleAccessToken: string) => {
    const res = await axios.post('https://ssa-server-production.up.railway.app/api/auth/google-login', {
      access_token: googleAccessToken
    });
    const { token, user } = res.data;
    localStorage.setItem('token', token);
    setUser({ id: '1', ...user });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateProfile = (updates: Partial<User>) => {
    if (user) setUser({ ...user, ...updates });
  };

  const getProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://ssa-server-production.up.railway.app/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser({ id: '1', ...res.data.user });
    } catch (err) {
      console.error('Failed to fetch profile', err);
    }
  };

  return (
      <AuthContext.Provider
          value={{
            user,
            isAuthenticated: !!user,
            login,
            signup,
            googleLogin,   // ⬅️ exposed
            logout,
            updateProfile,
            getProfile,
            setUser         // ⬅️ exposed
          }}
      >
        {children}
      </AuthContext.Provider>
  );
};
