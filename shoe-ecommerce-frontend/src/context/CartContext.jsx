import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import apiFetch from "../utils/apiFetch.jsx";
import { useAuth } from "./AuthContext.jsx";

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
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
        setCartItems(data.cartItems || []);
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
  const addToCart = async (productId, quantity = 1) => {
    try {
      const res = await apiFetch('/api/cart', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add item");

      setCartItems(data.cartItems || []);
      toast.success("Item added to cart");
    } catch (err) {
      toast.error(err.message || "Failed to add item");
    }
  };

  // --- Remove from cart ---
  const removeFromCart = async (productId) => {
    try {
      const res = await apiFetch(`/api/cart/${productId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to remove item");

      setCartItems(data.cartItems || []);
    } catch (err) {
      toast.error(err.message || "Failed to remove item");
    }
  };

  // --- Update quantity ---
  const updateQuantity = async (productId, quantity) => {
    try {
      const res = await apiFetch(`/api/cart/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update quantity");

      setCartItems(data.cartItems || []);
    } catch (err) {
      toast.error(err.message || "Failed to update quantity");
    }
  };

  // --- Increment ---
  const incrementItem = async (productId) => {
    try {
      const res = await apiFetch(`/api/cart/${productId}/increment`, {
        method: "PATCH",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to increment");

      setCartItems(data.cartItems || []);
    } catch (err) {
      toast.error(err.message || "Failed to increment item");
    }
  };

  // --- Decrement ---
  const decrementItem = async (productId) => {
    try {
      const res = await apiFetch(`/api/cart/${productId}/decrement`, {
        method: "PATCH",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to decrement");

      setCartItems(data.cartItems || []);
    } catch (err) {
      toast.error(err.message || "Failed to decrement item");
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        incrementItem,
        decrementItem,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
