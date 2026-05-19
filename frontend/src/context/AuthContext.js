import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

/**
 * Контекст аутентификации пользователя.
 * <p>
 * Хранит данные текущего пользователя, его роль, а также методы входа,
 * выхода и регистрации.
 */
const AuthContext = createContext();

/**
 * Провайдер контекста аутентификации.
 *
 * @param {Object} props свойства компонента
 * @param {React.ReactNode} props.children дочерние элементы
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(localStorage.getItem('username') || null);
  const [role, setRole] = useState(localStorage.getItem('role') || null);

  /**
   * Дополнительная проверка состояния аутентификации при загрузке приложения.
   */
  useEffect(() => {
    // Если нужно, можно проверить токен на сервере при старте
  }, []);

  /**
   * Выполняет вход пользователя и сохраняет данные авторизации.
   *
   * @param {string} username имя пользователя
   * @param {string} password пароль
   * @returns {Promise<Object>} данные ответа сервера
   */
  async function login(username, password) {
    const res = await api.post('/auth/signin', { username, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('username', res.data.username);
    localStorage.setItem('role', res.data.role);
    setUser(res.data.username);
    setRole(res.data.role);
    return res.data;
  }

  /**
   * Завершает пользовательскую сессию.
   */
  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    setUser(null);
    setRole(null);
  }

  /**
   * Регистрирует нового пользователя.
   *
   * @param {string} username имя пользователя
   * @param {string} password пароль
   * @returns {Promise<Object>} данные ответа сервера
   */
  async function register(username, password) {
    const res = await api.post('/auth/signup', { username, password });
    return res.data;
  }

  return (
    <AuthContext.Provider value={{ user, role, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Хук для получения контекста аутентификации.
 *
 * @returns {Object} объект контекста AuthContext
 */
export function useAuth() {
  return useContext(AuthContext);
}