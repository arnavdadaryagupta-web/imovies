import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('imovies_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.login(email, password);
      const userObj = {
        ...data.user,
        token: data.token,
      };
      setUser(userObj);
      localStorage.setItem('imovies_user', JSON.stringify(userObj));
      setLoading(false);
      return userObj;
    } catch (err) {
      setLoading(false);
      setError(err.message);
      throw err;
    }
  };

  const register = async (name, email, password, phone) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.register(name, email, password, phone);
      const userObj = {
        ...data.user,
        token: data.token,
      };
      setUser(userObj);
      localStorage.setItem('imovies_user', JSON.stringify(userObj));
      setLoading(false);
      return userObj;
    } catch (err) {
      setLoading(false);
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('imovies_user');
  };

  const loginAsUser = () => login('john@example.com', 'password123');
  const loginAsAdmin = () => login('admin@imovies.com', 'admin123');

  const isAdmin = user && user.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        loading,
        error,
        login,
        register,
        logout,
        loginAsUser,
        loginAsAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
