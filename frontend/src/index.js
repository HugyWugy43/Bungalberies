/**
 * @file index.js
 * @brief Точка входа в React-приложение
 */

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import './index.css';

/**
 * Рендер приложения с подключением контекстов:
 * - AuthProvider (авторизация)
 * - CartProvider (корзина)
 */
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
);