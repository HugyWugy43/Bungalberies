import React from 'react';
import './ProductCard.css';
import Button from './ui/Button';

export default function ProductCard({ product, onAddToCart }) {
  return (
    <div className="product-card">
      <img src={product.imageUrl || '/placeholder.png'} alt={product.name} className="product-card__img" />
      <div className="product-card__body">
        <h3 className="product-card__title">{product.name}</h3>
        <p className="product-card__price">{product.price} ₽</p>
        <Button onClick={() => onAddToCart(product)}>В корзину</Button>
      </div>
    </div>
  );
}
