import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import { API_ENDPOINTS } from '../utils/constants';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('access_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      if (token) {
        try {
          const response = await api.get(API_ENDPOINTS.ME);
          if (response.data && typeof response.data === 'object' && response.data.id) {
            setUser(response.data);
          } else {
            console.warn('Received invalid user data from auth/me, clearing session');
            setUser(null);
            setToken(null);
            localStorage.removeItem('access_token');
          }
        } catch (error) {
          console.error('Failed to fetch user', error);
          setUser(null);
          setToken(null);
          localStorage.removeItem('access_token');
        }
      }
      setLoading(false);
    };

    fetchMe();
    
    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
    };
    
    window.addEventListener('unauthorized', handleUnauthorized);
    return () => window.removeEventListener('unauthorized', handleUnauthorized);
  }, [token]);

  const login = async (username, password) => {
    const response = await api.post(API_ENDPOINTS.LOGIN, { username, password });
    const { access_token } = response.data;
    localStorage.setItem('access_token', access_token);
    setToken(access_token);
    return response.data;
  };

  const register = async (userData) => {
    const response = await api.post(API_ENDPOINTS.REGISTER, userData);
    const { access_token } = response.data;
    localStorage.setItem('access_token', access_token);
    setToken(access_token);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
