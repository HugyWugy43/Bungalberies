import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const GUEST_STORAGE_KEY = 'bungalberies_guest_cart';

function loadGuestCart() {
  try {
    const data = localStorage.getItem(GUEST_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveGuestCart(cart) {
  localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(cart));
}

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  const isGuest = !user;

  useEffect(() => {
    if (isGuest) {
      setCart(loadGuestCart());
      setLoading(false);
    } else {
      api.get('/cart')
        .then(res => {
          const items = res.data.map(item => ({
            id: item.id,
            cartId: item.id,
            productId: item.product?.id || item.productId,
            name: item.product?.name || item.productName,
            price: item.product?.price || item.price,
            quantity: item.quantity
          }));
          setCart(items);
        })
        .catch(() => setCart([]))
        .finally(() => setLoading(false));
    }
  }, [user, isGuest]);

  useEffect(() => {
    if (isGuest) {
      saveGuestCart(cart);
    }
  }, [cart, isGuest]);

  const addToCart = useCallback(async (product) => {
    if (isGuest) {
      setCart(prev => {
        const found = prev.find(p => p.productId === product.id);
        if (found) {
          return prev.map(p => p.productId === product.id ? { ...p, quantity: p.quantity + 1 } : p);
        }
        return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: 1 }];
      });
      return;
    }

    try {
      const res = await api.post('/cart', { productId: product.id, quantity: 1 });
      const data = res.data;
      if (data.guest) {
        setCart(prev => {
          const found = prev.find(p => p.productId === product.id);
          if (found) {
            return prev.map(p => p.productId === product.id ? { ...p, quantity: p.quantity + 1 } : p);
          }
          return [...prev, { productId: product.id, name: data.name, price: data.price, quantity: data.quantity }];
        });
      } else {
        setCart(prev => {
          const found = prev.find(p => p.productId === product.id);
          if (found) {
            return prev.map(p => p.productId === product.id ? { ...p, quantity: p.quantity + 1, cartId: data.id } : p);
          }
          return [...prev, { id: data.id, cartId: data.id, productId: product.id, name: product.name, price: product.price, quantity: 1 }];
        });
      }
    } catch (err) {
      console.error('Failed to add to cart:', err);
    }
  }, [isGuest]);

  const removeFromCart = useCallback(async (cartId) => {
    if (isGuest) {
      setCart(prev => prev.filter(p => p.cartId !== cartId && p.productId !== cartId));
      return;
    }

    try {
      await api.delete(`/cart/${cartId}`);
      setCart(prev => prev.filter(p => p.cartId !== cartId));
    } catch (err) {
      console.error('Failed to remove from cart:', err);
    }
  }, [isGuest]);

  const updateQuantity = useCallback(async (cartId, qty) => {
    if (isGuest) {
      setCart(prev => prev.map(p => (p.cartId === cartId || p.productId === cartId) ? { ...p, quantity: qty } : p));
      return;
    }

    try {
      await api.put(`/cart/${cartId}`, { quantity: qty });
      setCart(prev => prev.map(p => p.cartId === cartId ? { ...p, quantity: qty } : p));
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }
  }, [isGuest]);

  const clearCart = useCallback(async () => {
    if (isGuest) {
      setCart([]);
      return;
    }

    try {
      await api.delete('/cart');
      setCart([]);
    } catch (err) {
      console.error('Failed to clear cart:', err);
    }
  }, [isGuest]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, loading }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
