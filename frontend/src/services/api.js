/**
 * @file api.js
 * @brief Конфигурация HTTP-клиента для работы с backend API
 *
 * Используется библиотека axios для выполнения HTTP-запросов.
 * Добавляет JWT-токен в заголовок Authorization автоматически.
 */

import axios from 'axios';

/**
 * Экземпляр API клиента
 */
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Интерцептор запросов
 * Добавляет JWT токен в заголовок Authorization при наличии
 */
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => Promise.reject(error));

export default api;