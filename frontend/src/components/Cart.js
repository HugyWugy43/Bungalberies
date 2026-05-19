import React from 'react';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

/**
 * Компонент корзины покупателя.
 * <p>
 * Отображает товары в корзине, позволяет изменять их количество,
 * удалять позиции и оформлять заказ.
 */
export default function Cart() {
  const { cart, clearCart, updateQuantity, removeFromCart } = useCart();
  const { user } = useAuth();

  const total = cart.reduce((s, p) => s + p.price * p.quantity, 0);

  /**
   * Оформляет заказ на основании содержимого корзины.
   * <p>
   * Передает список позиций на сервер и очищает корзину после успешного оформления.
   */
  const checkout = async () => {
    if (!user) {
      alert('Нужно войти, чтобы оформить заказ.');
      return;
    }
    const items = cart.map(p => ({ productId: p.id, quantity: p.quantity }));
    try {
      const res = await api.post('/orders', items);
      alert('Заказ оформлен. Номер: ' + (res.data.id || '—'));
      clearCart();
    } catch (err) {
      console.error(err);
      alert('Ошибка при оформлении: ' + (err.response?.data || err.message));
    }
  };

  return (
    <div>
      <h2>Корзина</h2>
      {cart.length === 0 && <p>Корзина пуста</p>}
      {cart.map(p => (
        <div key={p.id} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
          <div style={{ flex: 1 }}>
            <div><strong>{p.name}</strong></div>
            <div>{p.price} ₽ × {p.quantity} = {p.price * p.quantity} ₽</div>
            <div style={{ marginTop: 6 }}>
              <button onClick={() => updateQuantity(p.id, Math.max(1, p.quantity - 1))}>−</button>
              <span style={{ margin: '0 8px' }}>{p.quantity}</span>
              <button onClick={() => updateQuantity(p.id, p.quantity + 1)}>+</button>
              <button onClick={() => removeFromCart(p.id)} style={{ marginLeft: 8 }}>Удалить</button>
            </div>
          </div>
        </div>
      ))}
      <div style={{ marginTop: 12 }}>
        <strong>Итого: {total} ₽</strong>
      </div>
      <div style={{ marginTop: 12 }}>
        <button onClick={checkout} disabled={cart.length === 0}>Оформить заказ</button>
        <button onClick={clearCart} disabled={cart.length === 0} style={{ marginLeft: 8 }}>Очистить</button>
      </div>
    </div>
  );
}