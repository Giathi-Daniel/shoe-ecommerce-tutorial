import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiFetch from '../utils/apiFetch.jsx';
import { useAuth } from './AuthContext.jsx';
import { calculatePricing, normalizeCartItem } from '../utils/productUtils.js';

const CartContext = createContext();

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}

function getCartItems(payload) {
  const items = payload?.cartItems || payload?.cart?.items || [];
  return Array.isArray(items) ? items.map(normalizeCartItem).filter((item) => item.product._id) : [];
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    apiFetch('/api/cart')
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load cart');
        if (!cancelled) setCartItems(getCartItems(await res.json()));
      })
      .catch((err) => !cancelled && toast.error(err.message))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  const requireLogin = useCallback((message) => {
    toast.info(message);
    navigate('/login', { state: { from: location.pathname + location.search } });
  }, [navigate, location]);

  const mutate = useCallback(async (url, options, fallbackMessage) => {
    try {
      const res = await apiFetch(url, options);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || fallbackMessage);
      setCartItems(getCartItems(data));
      return true;
    } catch (err) {
      toast.error(err.message || fallbackMessage);
      return false;
    }
  }, []);

  const addToCart = useCallback(async (productId, quantity = 1, { size, color } = {}) => {
    if (!user) {
      requireLogin('Please sign in to add items to your cart.');
      return false;
    }
    const ok = await mutate('/api/cart', { method: 'POST', body: JSON.stringify({ productId, quantity, size, color }) }, 'Failed to add item');
    if (ok) toast.success('Added to cart');
    return ok;
  }, [mutate, requireLogin, user]);

  const removeFromCart = useCallback((itemId) => (
    mutate(`/api/cart/${itemId}`, { method: 'DELETE' }, 'Failed to remove item')
  ), [mutate]);

  const updateQuantity = useCallback((itemId, quantity) => (
    mutate(`/api/cart/${itemId}`, { method: 'PATCH', body: JSON.stringify({ quantity }) }, 'Failed to update quantity')
  ), [mutate]);

  const clearCart = useCallback(() => (
    mutate('/api/cart', { method: 'DELETE' }, 'Failed to clear cart')
  ), [mutate]);

  const resetCart = useCallback(() => setCartItems([]), []);

  const value = useMemo(() => {
    const pricing = calculatePricing(cartItems);
    return {
      cartItems,
      loading,
      itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      pricing,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      resetCart,
    };
  }, [addToCart, cartItems, clearCart, loading, removeFromCart, resetCart, updateQuantity]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
