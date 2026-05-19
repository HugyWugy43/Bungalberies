import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

export default function Header({ user, onLogout, cartItemCount }) {
  return (
    <header className="site-header">
      <div className="site-header__container">
        <Link to="/" className="site-header__logo">OnlineShop</Link>
        <nav className="site-header__nav">
          <Link to="/products">Товары</Link>
          {user ? (
            <>
              <Link to="/cart">Корзина ({cartItemCount})</Link>
              {user.role === 'ROLE_ADMIN' && <Link to="/admin">Админ</Link>}
              <button onClick={onLogout} className="site-header__logout">Выйти</button>
            </>
          ) : (
            <>
              <Link to="/login">Войти</Link>
              <Link to="/register">Регистрация</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
