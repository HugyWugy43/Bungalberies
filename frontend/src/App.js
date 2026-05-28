import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
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
import api from './services/api';

function Header() {
  const { cart } = useCart();
  const { user, logout } = useAuth();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (query.trim().length === 0) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      api.get(`/products/search?q=${encodeURIComponent(query.trim())}`)
        .then(res => {
          setSuggestions(res.data.slice(0, 8));
          setShowDropdown(res.data.length > 0);
          setSelectedIdx(-1);
        })
        .catch(() => {});
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target) &&
          inputRef.current && !inputRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const doSearch = useCallback((term) => {
    setShowDropdown(false);
    if (term.trim()) {
      navigate(`/?q=${encodeURIComponent(term.trim())}`);
    } else {
      navigate('/');
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedIdx >= 0 && suggestions[selectedIdx]) {
      doSearch(suggestions[selectedIdx].name);
    } else {
      doSearch(query);
    }
  };

  const handleKeyDown = (e) => {
    if (!showDropdown) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const linkClass = ({ isActive }) => isActive ? 'active' : '';

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <NavLink to="/" className="site-header__logo">
          Bungalberies
        </NavLink>

        <form className="search-bar" onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            className="search-bar__input"
            placeholder="Поиск товаров..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
            onKeyDown={handleKeyDown}
          />
          <button type="submit" className="search-bar__btn">🔍</button>
          {showDropdown && (
            <div className="search-bar__dropdown" ref={dropdownRef}>
              {suggestions.map((p, i) => (
                <div
                  key={p.id}
                  className={`search-bar__item ${i === selectedIdx ? 'search-bar__item--active' : ''}`}
                  onClick={() => { setQuery(p.name); doSearch(p.name); }}
                  onMouseEnter={() => setSelectedIdx(i)}
                >
                  <span className="search-bar__item-name">{p.name}</span>
                  <span className="search-bar__item-price">{p.price} ₽</span>
                </div>
              ))}
            </div>
          )}
        </form>

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
