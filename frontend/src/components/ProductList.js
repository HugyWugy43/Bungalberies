import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  useEffect(() => {
    setLoading(true);
    api.get('/products')
      .then(res => { setProducts(res.data); setLoading(false); })
      .catch(err => { setError(err.message || 'Ошибка загрузки'); setLoading(false); });
  }, []);

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    return products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q))
    );
  }, [products, searchQuery]);

  const handleAddToCart = useCallback((product) => {
    setProducts(prev => prev.map(p =>
      p.id === product.id ? { ...p, quantity: Math.max(0, p.quantity - 1) } : p
    ));
    addToCart(product);
  }, [addToCart]);

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="loading"><div className="spinner" /> Загрузка товаров...</div>
      </div>
    );
  }

  if (error) return <div className="page-wrapper"><div className="alert alert-error">Ошибка: {error}</div></div>;

  return (
    <div className="page-wrapper">
      <h2 className="page-title">
        {searchQuery ? `Результаты поиска: «${searchQuery}»` : 'Каталог'}
      </h2>
      {searchQuery && filteredProducts.length === 0 && (
        <div className="alert alert-info">Ничего не найдено</div>
      )}
      <div className="product-grid">
        {filteredProducts.map(p => (
          <div key={p.id} className="card card-hover product-card">

            {p.quantity === 0 && (
              <div className="product-card__overlay">
                Товар отсутствует
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3 className="product-card__name" style={{ flex: 1 }}>{p.name}</h3>
              {user && (
                <button
                  className={`wishlist-btn ${isInWishlist(p.id) ? 'wishlist-btn--active' : ''}`}
                  onClick={() => toggleWishlist(p)}
                  title={isInWishlist(p.id) ? 'Удалить из избранного' : 'Добавить в избранное'}
                >
                  {isInWishlist(p.id) ? '♥' : '♡'}
                </button>
              )}
            </div>

            <p className="product-card__desc">{p.description}</p>
            <div className="product-card__price">{p.price} ₽</div>
            <div className={`product-card__stock ${p.quantity > 0 ? 'product-card__stock--in' : 'product-card__stock--out'}`}>
              {p.quantity > 0 ? `В наличии: ${p.quantity} шт.` : 'Нет на складе'}
            </div>

            <button
              onClick={() => handleAddToCart(p)}
              disabled={p.quantity === 0}
              className={`btn ${p.quantity === 0 ? '' : 'btn-primary'}`}
              style={{ width: '100%', opacity: p.quantity === 0 ? 0.5 : 1 }}
            >
              {p.quantity === 0 ? 'Нет в наличии' : 'В корзину'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
