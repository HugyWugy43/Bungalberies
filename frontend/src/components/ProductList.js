import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useCart } from '../context/CartContext';

/**
 * Компонент отображения каталога товаров.
 * <p>
 * Загружает список товаров с сервера и позволяет добавлять выбранные позиции в корзину.
 */
export default function ProductList() {
  const [products, setProducts] = useState([]);
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Загружает товары при монтировании компонента.
   */
  useEffect(() => {
    setLoading(true);
    api.get('/products')
      .then(res => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Error');
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Загрузка товаров...</div>;
  if (error) return <div>Ошибка: {error}</div>;

  return (
    <div>
      <h2>Каталог</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
        {products.map(p => (
          <div key={p.id} style={{ border: '1px solid #eee', padding: 12, borderRadius: 6 }}>
            <h3 style={{ margin: '4px 0' }}>{p.name}</h3>
            <p style={{ margin: '6px 0' }}>{p.description}</p>
            <div style={{ marginBottom: 8 }}><strong>{p.price} ₽</strong></div>
            <div style={{ marginBottom: 8 }}>В наличии: {p.stock}</div>
            <button onClick={() => addToCart(p)} disabled={p.stock === 0}>
              {p.stock === 0 ? 'Нет в наличии' : 'Добавить в корзину'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}