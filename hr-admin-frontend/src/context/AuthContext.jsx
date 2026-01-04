import React, { createContext, useState, useEffect, useContext } from 'react';
import authApi from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      setUser({ token }); 
    }
    setLoading(false);
  }, [token]);

  const login = async (username, password) => {
    try {
      const response = await authApi.post('/auth/login', { username, password });
      const { token, fullName, iban } = response.data;
      
      localStorage.setItem('token', token);
      setToken(token);
      setUser({ fullName, iban });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      await authApi.post('/auth/register', userData);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);