import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function WishlistPage() {
  const { user } = useAuth();
  const { wishlist, toggleWishlist, loading } = useWishlist();
  const { addToCart } = useCart();

  if (!user) {
    return (
      <div className="page-wrapper page-wrapper-sm" style={{ textAlign: 'center' }}>
        <h2 className="page-title" style={{ textAlign: 'center' }}>Избранное</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          <Link to="/login">Войдите</Link>, чтобы видеть избранное.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="loading"><div className="spinner" /> Загрузка...</div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="page-wrapper page-wrapper-sm" style={{ textAlign: 'center' }}>
        <h2 className="page-title" style={{ textAlign: 'center' }}>Избранное</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Список избранного пуст.</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 16 }}>В каталог</Link>
      </div>
    );
  }

  return (
    <div className="page-wrapper page-wrapper-sm">
      <h2 className="page-title">Избранное</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {wishlist.map(item => {
          const p = item.product;
          return (
            <div key={item.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{p?.name || 'Товар'}</div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                  {p?.price ? `${p.price} ₽` : ''}
                </div>
              </div>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => addToCart(p)}
                disabled={p?.quantity === 0}
              >
                В корзину
              </button>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => toggleWishlist(p)}
                title="Удалить из избранного"
              >
                ♥
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
