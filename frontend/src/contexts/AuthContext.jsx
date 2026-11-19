import { createContext, useContext, useState, useEffect } from 'react';
import { apiPost, apiGet, apiPut } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage
    const token = localStorage.getItem('vs_token');
    const profile = localStorage.getItem('vs_profile');
    if (token && profile) {
      try {
        setUser(JSON.parse(profile));
      } catch { /* ignore */ }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await apiPost('/api/auth/login', { email, password });
    localStorage.setItem('vs_token', data.token);
    localStorage.setItem('vs_user_id', data.user_id);
    localStorage.setItem('vs_profile', JSON.stringify(data.profile));
    setUser(data.profile);
    return data;
  };

  const register = async (formData) => {
    const data = await apiPost('/api/auth/register', formData);
    localStorage.setItem('vs_token', data.token);
    localStorage.setItem('vs_user_id', data.user_id);
    localStorage.setItem('vs_profile', JSON.stringify(data.profile));
    setUser(data.profile);
    return data;
  };

  const updateProfile = async (profileData) => {
    const userId = localStorage.getItem('vs_user_id') || 'demo_doctor';
    const data = await apiPut(`/api/auth/profile?user_id=${userId}`, profileData);
    localStorage.setItem('vs_profile', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('vs_token');
    localStorage.removeItem('vs_user_id');
    localStorage.removeItem('vs_profile');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
