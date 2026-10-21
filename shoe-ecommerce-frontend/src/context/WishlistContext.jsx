import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiFetch from '../utils/apiFetch.jsx';
import { useAuth } from './AuthContext.jsx';
import { normalizeWishlistItem } from '../utils/productUtils.js';

const WishlistContext = createContext();

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
}

function getWishlistItems(payload) {
  const items = payload?.wishlist?.items || [];
  return Array.isArray(items) ? items.map(normalizeWishlistItem) : [];
}

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) {
      setWishlistItems([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    apiFetch('/api/wishlist')
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load wishlist');
        if (!cancelled) setWishlistItems(getWishlistItems(await res.json()));
      })
      .catch((err) => !cancelled && toast.error(err.message))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [user]);

  const mutate = useCallback(async (url, options, fallbackMessage) => {
    try {
      const res = await apiFetch(url, options);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || fallbackMessage);
      setWishlistItems(getWishlistItems(data));
      return true;
    } catch (err) {
      toast.error(err.message || fallbackMessage);
      return false;
    }
  }, []);

  const addToWishlist = useCallback(async (productId) => {
    const ok = await mutate('/api/wishlist', { method: 'POST', body: JSON.stringify({ productId }) }, 'Failed to add to wishlist');
    if (ok) toast.success('Saved to your wishlist');
    return ok;
  }, [mutate]);

  const removeFromWishlist = useCallback((productId) => (
    mutate(`/api/wishlist/${productId}`, { method: 'DELETE' }, 'Failed to remove from wishlist')
  ), [mutate]);

  const wishlistIds = useMemo(() => new Set(wishlistItems.map((item) => item.productId)), [wishlistItems]);

  const isInWishlist = useCallback((productId) => wishlistIds.has(String(productId)), [wishlistIds]);

  const toggleWishlist = useCallback(async (productId) => {
    if (!user) {
      toast.info('Please sign in to save items to your wishlist.');
      navigate('/login', { state: { from: location.pathname + location.search } });
      return false;
    }
    return wishlistIds.has(String(productId)) ? removeFromWishlist(productId) : addToWishlist(productId);
  }, [addToWishlist, location, navigate, removeFromWishlist, user, wishlistIds]);

  const value = useMemo(() => ({
    wishlistItems,
    loading,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
  }), [addToWishlist, isInWishlist, loading, removeFromWishlist, toggleWishlist, wishlistItems]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}
