import React, { createContext, useContext, useState } from 'react';

/**
 * Контекст корзины покупателя.
 * <p>
 * Содержит текущее состояние корзины и методы для добавления,
 * удаления и изменения количества товаров.
 */
const CartContext = createContext();

/**
 * Провайдер контекста корзины.
 *
 * @param {Object} props свойства компонента
 * @param {React.ReactNode} props.children дочерние элементы
 */
export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  /**
   * Добавляет товар в корзину.
   * <p>
   * Если товар уже присутствует в корзине, увеличивает его количество.
   *
   * @param {Object} product объект товара
   */
  function addToCart(product) {
    setCart(prev => {
      const found = prev.find(p => p.id === product.id);
      if (found) {
        return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }

  /**
   * Удаляет товар из корзины.
   *
   * @param {number} productId идентификатор товара
   */
  function removeFromCart(productId) {
    setCart(prev => prev.filter(p => p.id !== productId));
  }

  /**
   * Изменяет количество выбранного товара.
   *
   * @param {number} productId идентификатор товара
   * @param {number} qty новое количество
   */
  function updateQuantity(productId, qty) {
    setCart(prev => prev.map(p => p.id === productId ? { ...p, quantity: qty } : p));
  }

  /**
   * Очищает корзину полностью.
   */
  function clearCart() {
    setCart([]);
  }

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

/**
 * Хук для получения контекста корзины.
 *
 * @returns {Object} объект контекста CartContext
 */
export function useCart() {
  return useContext(CartContext);
}