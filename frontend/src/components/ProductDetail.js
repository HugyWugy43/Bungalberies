import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(res => { setProduct(res.data); setLoading(false); })
      .catch(err => { setError('Товар не найден'); setLoading(false); });
  }, [id]);

  if (loading) return <div className="page-wrapper"><div className="loading"><div className="spinner" /></div></div>;
  if (error) return <div className="page-wrapper"><div className="alert alert-error">{error}</div></div>;
  if (!product) return null;

  const imgSrc = product.photo || product.imageUrl;

  return (
    <div className="page-wrapper page-wrapper-md">
      <Link to="/" className="btn btn-outline btn-sm" style={{ marginBottom: 16 }}>← Назад к каталогу</Link>
      <div className="product-detail">
        {imgSrc && (
          <div className="product-detail__image">
            <img src={imgSrc} alt={product.name} />
          </div>
        )}
        <div className="product-detail__info">
          <h1 className="product-detail__name">{product.name}</h1>
          <div className="product-detail__price">{product.price} ₽</div>
          <div className={`product-detail__stock ${product.quantity > 0 ? 'in' : 'out'}`}>
            {product.quantity > 0 ? `В наличии: ${product.quantity} шт.` : 'Нет на складе'}
          </div>
          <p className="product-detail__desc">{product.description}</p>
          {product.characteristics && (
            <div className="product-detail__chars">
              <h3>Характеристики</h3>
              <pre style={{ fontFamily: 'inherit', whiteSpace: 'pre-wrap', margin: 0, fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{product.characteristics}</pre>
            </div>
          )}
          <button
            className={`btn ${added ? 'btn-success' : 'btn-primary'} btn-lg`}
            onClick={() => { addToCart(product); setAdded(true); setTimeout(() => setAdded(false), 1500); }}
            disabled={product.quantity === 0}
            style={{ width: '100%', marginTop: 16 }}
          >
            {added ? '✓ Добавлено' : product.quantity === 0 ? 'Нет в наличии' : 'В корзину'}
          </button>
        </div>
      </div>
    </div>
  );
}
