import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import apiFetch from '../utils/apiFetch.jsx';
import { useAuth } from './AuthContext.jsx';
import { getProductId, normalizeWishlistItem } from '../utils/productUtils.js';

const WishlistContext = createContext();

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
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

  useEffect(() => {
    if (!user) { setWishlistItems([]); return; }
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await apiFetch('/api/wishlist');
        const data = await res.json();
        setWishlistItems(getWishlistItems(data));
      } catch { toast.error('Failed to load wishlist'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [user]);

  const addToWishlist = useCallback(async (productId) => {
    try {
      const res = await apiFetch('/api/wishlist', {
        method: 'POST',
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setWishlistItems(getWishlistItems(data));
      toast.success('Added to wishlist');
    } catch (err) { toast.error(err.message || 'Failed to add to wishlist'); }
  }, []);

  const removeFromWishlist = useCallback(async (productId) => {
    try {
      const res = await apiFetch(`/api/wishlist/${productId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setWishlistItems(getWishlistItems(data));
    } catch (err) { toast.error(err.message || 'Failed to remove from wishlist'); }
  }, []);

  const wishlistIds = useMemo(
    () => new Set(wishlistItems.map((item) => String(item.productId || getProductId(item)))),
    [wishlistItems]
  );

  const isInWishlist = useCallback((productId) => (
    wishlistIds.has(String(productId))
  ), [wishlistIds]);

  const value = useMemo(() => ({
    wishlistItems,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  }), [addToWishlist, isInWishlist, loading, removeFromWishlist, wishlistItems]);

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}
