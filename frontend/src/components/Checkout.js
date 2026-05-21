import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Checkout() {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const total = cart.reduce((s, p) => s + p.price * p.quantity, 0);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(null);

    if (cart.length === 0) {
      setError('Корзина пуста');
      return;
    }

    setLoading(true);

    try {
      let res;
      if (user) {
        res = await api.post('/orders/from-cart');
      } else {
        if (!form.name.trim()) {
          setError('Укажите имя');
          setLoading(false);
          return;
        }
        if (!form.phone.trim()) {
          setError('Укажите телефон');
          setLoading(false);
          return;
        }
        const payload = {
          customerName: form.name.trim(),
          customerEmail: form.email.trim(),
          customerPhone: form.phone.trim(),
          shippingAddress: form.address.trim(),
          items: cart.map(p => ({ productId: p.productId, quantity: p.quantity }))
        };
        res = await api.post('/orders/guest', payload);
      }
      setSuccess(res.data);
      clearCart();
    } catch (err) {
      setError(err.response?.data || 'Ошибка при оформлении заказа');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="page-wrapper page-wrapper-sm" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <h2 className="page-title" style={{ textAlign: 'center' }}>Заказ оформлен!</h2>
        <p>Номер заказа: <strong>#{success.id}</strong></p>
        <p style={{ color: 'var(--text-secondary)' }}>Мы свяжемся с вами для подтверждения.</p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 24 }}>
          <button className="btn btn-primary" onClick={() => navigate('/track')}>
            Отследить заказ
          </button>
          <button className="btn btn-outline" onClick={() => navigate('/')}>
            В каталог
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper page-wrapper-sm">
      <h2 className="page-title">Оформление заказа</h2>

      <div className="order-summary">
        <h3 style={{ marginTop: 0, fontSize: 16 }}>Ваш заказ</h3>
        {cart.map(p => (
          <div key={p.cartId || p.productId} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 14 }}>
            <span>{p.name} × {p.quantity}</span>
            <span style={{ fontWeight: 500 }}>{p.price * p.quantity} ₽</span>
          </div>
        ))}
        <div style={{ borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 8, fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
          <span>Итого:</span>
          <span>{total} ₽</span>
        </div>
      </div>

      {!user && (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Имя *</label>
            <input
              id="name" name="name" type="text" required
              className="form-input"
              value={form.name} onChange={handleChange}
              placeholder="Иван Иванов"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="phone">Телефон *</label>
            <input
              id="phone" name="phone" type="tel" required
              className="form-input"
              value={form.phone} onChange={handleChange}
              placeholder="+7 (999) 123-45-67"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email" name="email" type="email"
              className="form-input"
              value={form.email} onChange={handleChange}
              placeholder="ivan@example.com"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="address">Адрес доставки</label>
            <textarea
              id="address" name="address" rows={3}
              className="form-input"
              value={form.address} onChange={handleChange}
              placeholder="Город, улица, дом, квартира"
            />
          </div>
        </form>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      <button
        type="submit"
        onClick={handleSubmit}
        disabled={loading}
        className="btn btn-secondary btn-lg"
        style={{ width: '100%' }}
      >
        {loading ? 'Оформление...' : 'Оформить заказ'}
      </button>
    </div>
  );
}
