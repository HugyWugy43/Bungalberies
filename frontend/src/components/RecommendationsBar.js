import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useCart } from '../context/CartContext';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function RecommendationsBar() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    api.get('/products')
      .then(res => {
        const products = res.data || [];
        setItems(shuffle(products).slice(0, 8));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || items.length === 0) return null;

  const doubled = [...items, ...items];

  return (
    <div className="rec-bar">
      <div className="rec-bar__track">
        <div className="rec-bar__scroll">
          {doubled.map((item, i) => (
            <div key={`${item.id}-${i}`} className="rec-card">
              <div className="rec-card__title">{item.name}</div>
              <div className="rec-card__price">{item.price} ₽</div>
              <button
                className="btn btn-primary btn-sm"
                onClick={(e) => { e.stopPropagation(); addToCart(item); }}
                disabled={item.quantity === 0}
                style={{ marginTop: 'auto' }}
              >
                В корзину
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
