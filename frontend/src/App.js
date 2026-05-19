/**
 * @file App.js
 * @brief Главный компонент приложения с маршрутизацией
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import Login from './components/Login';
import Register from './components/Register';
import AdminPanel from './components/AdminPanel';
import { useCart } from './context/CartContext';
import { useAuth } from './context/AuthContext';

/**
 * @component Header
 * @brief Верхняя панель навигации приложения
 */
function Header() {
  const { cart } = useCart();
  const { user, logout } = useAuth();

  return (
    <header style={{ padding: 12, borderBottom: '1px solid #ddd', display: 'flex', gap: 12, alignItems: 'center' }}>
      <Link to="/">Каталог</Link>
      <Link to="/cart">Корзина ({cart.length})</Link>
      <Link to="/admin">Админ</Link>

      <div style={{ marginLeft: 'auto' }}>
        {user ? (
          <>
            <span style={{ marginRight: 10 }}>Привет, {user}</span>
            <button onClick={logout}>Выйти</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ marginRight: 8 }}>Вход</Link>
            <Link to="/register">Регистрация</Link>
          </>
        )}
      </div>
    </header>
  );
}

/**
 * @component App
 * @brief Корневой компонент приложения с маршрутизацией
 */
export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <main style={{ padding: 16 }}>
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}