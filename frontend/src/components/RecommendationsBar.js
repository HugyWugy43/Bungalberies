import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useCart } from '../context/CartContext';

const PROMOTIONS = [
  { id: 'promo-1', title: 'Скидка 10%', code: 'WELCOME10', desc: 'На первый заказ от 1000 ₽' },
  { id: 'promo-2', title: 'Бесплатная доставка', code: 'FREESHIP', desc: 'При заказе от 2000 ₽' },
  { id: 'promo-3', title: 'Скидка 15%', code: 'HOT15', desc: 'На весь ассортимент' },
  { id: 'promo-4', title: 'Подарок', code: 'GIFT2026', desc: 'При заказе от 3000 ₽' },
];

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
        const popular = shuffle(products).slice(0, 8);

        const mixed = shuffle([
          ...popular.map(p => ({ ...p, _type: 'product' })),
          ...PROMOTIONS.map(p => ({ ...p, _type: 'promo' })),
        ]);

        setItems(mixed);
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
            <div key={`${item.id}-${i}`} className={`rec-card ${item._type === 'promo' ? 'rec-card--promo' : ''}`}>
              {item._type === 'promo' ? (
                <>
                  <div className="rec-card__promo-badge">АКЦИЯ</div>
                  <div className="rec-card__title">{item.title}</div>
                  <div className="rec-card__desc">{item.desc}</div>
                  <div className="rec-card__code">{item.code}</div>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
