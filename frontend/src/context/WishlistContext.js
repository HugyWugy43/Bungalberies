import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setWishlist([]);
      return;
    }
    setLoading(true);
    api.get('/wishlist')
      .then(res => setWishlist(res.data || []))
      .catch(() => setWishlist([]))
      .finally(() => setLoading(false));
  }, [user]);

  const toggleWishlist = useCallback(async (product) => {
    if (!user) return;
    const existing = wishlist.find(w => w.product?.id === product.id || w.product?.id === product.productId);
    if (existing) {
      try {
        await api.delete(`/wishlist/${product.id || product.productId}`);
        setWishlist(prev => prev.filter(w => w.id !== existing.id));
      } catch (e) { console.error(e); }
    } else {
      try {
        const res = await api.post('/wishlist', { productId: product.id || product.productId });
        setWishlist(prev => [...prev, res.data]);
      } catch (e) { console.error(e); }
    }
  }, [user, wishlist]);

  const isInWishlist = useCallback((productId) => {
    return wishlist.some(w => (w.product?.id || w.product?.productId) === productId);
  }, [wishlist]);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist, loading }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
