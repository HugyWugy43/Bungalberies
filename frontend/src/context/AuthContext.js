import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(localStorage.getItem('username') || null);
  const [role, setRole] = useState(localStorage.getItem('role') || null);

  useEffect(() => {}, []);

  async function login(username, password, totpCode) {
    const body = { username, password };
    if (totpCode) body.totpCode = totpCode;
    const res = await api.post('/auth/signin', body);
    if (!res.data.token) {
      const err = new Error('TOTP required');
      err.response = { data: res.data };
      throw err;
    }
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('username', res.data.username);
    localStorage.setItem('role', res.data.role);
    setUser(res.data.username);
    setRole(res.data.role);
    return res.data;
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    setUser(null);
    setRole(null);
  }

  async function register(username, password, phone, email) {
    const res = await api.post('/auth/signup', { username, password, phone, email });
    return res.data;
  }

  return (
    <AuthContext.Provider value={{ user, role, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
