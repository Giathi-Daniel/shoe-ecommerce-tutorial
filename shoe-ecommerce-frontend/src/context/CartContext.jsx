import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import apiFetch from "../utils/apiFetch.jsx";
import { useAuth } from "./AuthContext.jsx";
import { normalizeCartItem } from "../utils/productUtils.js";

const CartContext = createContext();

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

function getCartItems(payload) {
  const items = payload?.cartItems || payload?.cart?.items || [];
  return Array.isArray(items) ? items.map(normalizeCartItem) : [];
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // --- Fetch cart on mount ---
  useEffect(() => {
    if (!user) {
      setCartItems([]);
      setLoading(false);
      return;
    }

    const fetchCart = async () => {
      setLoading(true);
      try {
        const res = await apiFetch('/api/cart', {
          method: "GET",
        });

        if (!res.ok) throw new Error("Failed to fetch cart items");

        const data = await res.json();
        setCartItems(getCartItems(data));
      } catch (err) {
        console.error("Failed to fetch cart:", err);
        toast.error(err.message || "Failed to load cart");
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [user]);

  // --- Add to cart ---
  const addToCart = useCallback(async (productId, quantity = 1) => {
    try {
      const res = await apiFetch('/api/cart', {
        method: "POST",
        body: JSON.stringify({ productId, quantity }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add item");

      setCartItems(getCartItems(data));
      toast.success("Item added to cart");
    } catch (err) {
      toast.error(err.message || "Failed to add item");
    }
  }, []);

  // --- Remove from cart ---
  const removeFromCart = useCallback(async (productId) => {
    try {
      const res = await apiFetch(`/api/cart/${productId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to remove item");

      setCartItems(getCartItems(data));
    } catch (err) {
      toast.error(err.message || "Failed to remove item");
    }
  }, []);

  // --- Update quantity ---
  const updateQuantity = useCallback(async (productId, quantity) => {
    try {
      const res = await apiFetch(`/api/cart/${productId}`, {
        method: "PATCH",
        body: JSON.stringify({ quantity }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update quantity");

      setCartItems(getCartItems(data));
    } catch (err) {
      toast.error(err.message || "Failed to update quantity");
    }
  }, []);

  // --- Increment ---
  const incrementItem = useCallback(async (productId) => {
    try {
      const res = await apiFetch(`/api/cart/${productId}/increment`, {
        method: "PATCH",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to increment");

      setCartItems(getCartItems(data));
    } catch (err) {
      toast.error(err.message || "Failed to increment item");
    }
  }, []);

  // --- Decrement ---
  const decrementItem = useCallback(async (productId) => {
    try {
      const res = await apiFetch(`/api/cart/${productId}/decrement`, {
        method: "PATCH",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to decrement");

      setCartItems(getCartItems(data));
    } catch (err) {
      toast.error(err.message || "Failed to decrement item");
    }
  }, []);

  const value = useMemo(() => ({
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    incrementItem,
    decrementItem,
    loading,
  }), [addToCart, cartItems, decrementItem, incrementItem, loading, removeFromCart, updateQuantity]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}
