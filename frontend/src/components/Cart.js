import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const navigate = useNavigate();
  const { cart, clearCart, updateQuantity, removeFromCart, loading } = useCart();

  const total = cart.reduce((s, p) => s + p.price * p.quantity, 0);

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="loading"><div className="spinner" /> Загрузка корзины...</div>
      </div>
    );
  }

  return (
    <div className="page-wrapper page-wrapper-sm">
      <h2 className="page-title">Корзина</h2>

      {cart.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>Корзина пуста</p>}

      {cart.map((p, i) => (
        <div key={p.cartId || p.productId} className="cart-item" style={{ animationDelay: `${i * 0.05}s` }}>
          <div className="cart-item__info">
            <div style={{ fontWeight: 600 }}>{p.name}</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 2 }}>
              {p.price} ₽ × {p.quantity} = {p.price * p.quantity} ₽
            </div>
            <div className="cart-item__controls" style={{ marginTop: 6 }}>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => updateQuantity(p.cartId || p.productId, Math.max(1, p.quantity - 1))}
              >
                −
              </button>
              <span className="cart-item__qty">{p.quantity}</span>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => updateQuantity(p.cartId || p.productId, p.quantity + 1)}
              >
                +
              </button>
              <button
                className="btn btn-danger btn-sm"
                style={{ marginLeft: 8 }}
                onClick={() => removeFromCart(p.cartId || p.productId)}
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      ))}

      {cart.length > 0 && (
        <>
          <div className="cart-total">Итого: {total} ₽</div>
          <div className="cart-actions">
            <button className="btn btn-secondary btn-lg" onClick={() => navigate('/checkout')}>
              Оформить заказ
            </button>
            <button className="btn btn-outline" onClick={clearCart}>
              Очистить
            </button>
          </div>
        </>
      )}
    </div>
  );
}
