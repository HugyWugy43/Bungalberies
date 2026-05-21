import React from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import OrderTrack from './components/OrderTrack';
import Login from './components/Login';
import Register from './components/Register';
import WishlistPage from './components/WishlistPage';
import AdminPanel from './components/AdminPanel';
import RecommendationsBar from './components/RecommendationsBar';
import PageTransition from './components/ui/PageTransition';
import { useCart } from './context/CartContext';
import { useAuth } from './context/AuthContext';
import { useWishlist } from './context/WishlistContext';

function Header() {
  const { cart } = useCart();
  const { user, logout } = useAuth();
  const { wishlist } = useWishlist();

  const linkClass = ({ isActive }) => isActive ? 'active' : '';

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <NavLink to="/" className="site-header__logo">
          Магазин
        </NavLink>

        <nav className="site-header__nav">
          <NavLink to="/" className={linkClass} end>
            Каталог
          </NavLink>
          {user && (
            <NavLink to="/wishlist" className={linkClass}>
              Избранное
              {wishlist.length > 0 && <span className="cart-badge">{wishlist.length}</span>}
            </NavLink>
          )}
          <NavLink to="/cart" className={linkClass}>
            Корзина
            {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
          </NavLink>
          <NavLink to="/track" className={linkClass}>
            Отследить
          </NavLink>
        </nav>

        <div className="site-header__right">
          {user ? (
            <>
              <span className="site-header__user">{user}</span>
              <button className="btn btn-outline btn-sm" onClick={logout}>
                Выйти
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>
                Вход
              </NavLink>
              <NavLink to="/register" className="btn btn-primary btn-sm">
                Регистрация
              </NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function AppLayout() {
  const location = useLocation();
  const isAdmin = location.pathname === '/admin';

  return (
    <>
      {!isAdmin && <Header />}
      {!isAdmin && <RecommendationsBar />}
      <main>
        <Routes>
          <Route path="/" element={<PageTransition><ProductList /></PageTransition>} />
          <Route path="/cart" element={<PageTransition><Cart /></PageTransition>} />
          <Route path="/checkout" element={<PageTransition><Checkout /></PageTransition>} />
          <Route path="/track" element={<PageTransition><OrderTrack /></PageTransition>} />
          <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
          <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
          <Route path="/wishlist" element={<PageTransition><WishlistPage /></PageTransition>} />
          <Route path="/admin" element={<PageTransition><AdminPanel /></PageTransition>} />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
