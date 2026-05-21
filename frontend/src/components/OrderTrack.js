import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function GuestSearch({ onOrdersFound }) {
  const [search, setSearch] = useState({ email: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setSearch(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');

    const email = search.email.trim();
    if (email && !EMAIL_REGEX.test(email)) {
      setError('Некорректный формат email');
      return;
    }
    if (!email && !search.phone.trim()) {
      setError('Введите email или телефон');
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (email) params.set('email', email);
      if (search.phone.trim()) params.set('phone', search.phone.trim());

      const res = await api.get(`/orders/track?${params.toString()}`);
      onOrdersFound(res.data);
    } catch (err) {
      setError(err.response?.data || 'Ошибка при поиске');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
        Введите email или телефон, указанный при оформлении заказа.
      </p>
      <form onSubmit={handleSearch} className="search-form">
        <input
          name="email" type="email"
          className="form-input"
          value={search.email} onChange={handleChange}
          placeholder="Email"
        />
        <input
          name="phone" type="tel"
          className="form-input"
          value={search.phone} onChange={handleChange}
          placeholder="Телефон"
        />
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Поиск...' : 'Найти'}
        </button>
      </form>
      {error && <div className="alert alert-error">{error}</div>}
    </>
  );
}

function OrdersList({ orders, searched }) {
  if (searched && orders.length === 0) {
    return <p style={{ color: 'var(--text-secondary)' }}>Заказы не найдены. Проверьте введённые данные.</p>;
  }

  return orders.map((order, i) => (
    <div
      key={order.id}
      className="card"
      style={{ marginBottom: 16, animation: `slideUp 0.3s ease ${i * 0.1}s both` }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <strong>Заказ #{order.id}</strong>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          {new Date(order.createdAt).toLocaleString('ru-RU')}
        </span>
      </div>
      <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>
        {order.customerName && <div>Имя: {order.customerName}</div>}
        {order.customerPhone && <div>Телефон: {order.customerPhone}</div>}
        {order.shippingAddress && <div>Адрес: {order.shippingAddress}</div>}
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Товар</th>
            <th style={{ textAlign: 'right' }}>Цена</th>
            <th style={{ textAlign: 'right' }}>Кол-во</th>
            <th style={{ textAlign: 'right' }}>Сумма</th>
          </tr>
        </thead>
        <tbody>
          {order.items?.map(item => (
            <tr key={item.id}>
              <td>{item.productName}</td>
              <td style={{ textAlign: 'right' }}>{item.price} ₽</td>
              <td style={{ textAlign: 'right' }}>{item.quantity}</td>
              <td style={{ textAlign: 'right' }}>{item.price * item.quantity} ₽</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ textAlign: 'right', fontWeight: 700, marginTop: 8 }}>
        Итого: {order.items?.reduce((s, i) => s + i.price * i.quantity, 0)} ₽
      </div>
    </div>
  ));
}

export default function OrderTrack() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setLoading(true);
      api.get('/orders/my')
        .then(res => { setOrders(res.data || []); setSearched(true); })
        .catch(() => { setOrders([]); setSearched(true); })
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (loading) {
    return (
      <div className="page-wrapper page-wrapper-md">
        <div className="loading"><div className="spinner" /> Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="page-wrapper page-wrapper-md">
      <h2 className="page-title">
        {user ? 'Мои заказы' : 'Отслеживание заказа'}
      </h2>

      {user ? (
        orders.length === 0 && searched ? (
          <p style={{ color: 'var(--text-secondary)' }}>У вас пока нет заказов.</p>
        ) : (
          <OrdersList orders={orders} searched={searched} />
        )
      ) : (
        <GuestSearch onOrdersFound={(data) => { setOrders(data); setSearched(true); }} />
      )}

      {!user && <OrdersList orders={orders} searched={searched} />}
    </div>
  );
}
