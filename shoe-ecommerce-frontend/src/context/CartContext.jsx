import { createContext, useContext, useEffect, useState } from "react";
import { toast } from 'react-toastify';
import fetchWithCsrf from '../utils/fetchWithCsrf';  

const CartContext = createContext();

export function useCart() {
    return useContext(CartContext);
}

export function CartProvider({ children }) {
    const [cartItems, setcartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            setcartItems([]);
            setLoading(false);
            return;
        }
        const fetchCart = async () => {
            try {
                const res = await fetch('/api/cart', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.message || 'Failed to fetch cart items');
                }
                const data = await res.json();
                setcartItems(data.cartItems || []);
            } catch (err) {
                console.error("Failed to fetch cart items:", err);
                toast.error(err.message || "Failed to load cart items");
            } finally {
                setLoading(false);
            }
        };
        fetchCart();
    }, [token]);

    const addToCart = async (productId, quantity = 1) => {
        try {
            const res = await fetchWithCsrf("/api/cart", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ productId, quantity })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || "Failed to add item to cart");
            }
            setcartItems(data.cartItems || []);
            toast.success("Item added to cart");
        } catch (err) {
            console.error('Failed to add item to cart:', err);
            toast.error(err.message || "Failed to add item to cart");
        }
    };

    const removeFromCart = async (productId) => {
        try {
            const res = await fetchWithCsrf(`/api/cart/${productId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            const updatedCart = await res.json();
            if (!res.ok) {
                throw new Error(updatedCart.message || "Failed to remove item from cart");
            }
            setcartItems(updatedCart.cartItems || []);
            toast.success("Item removed from cart");
        } catch (err) {
            console.error('Failed to remove item from cart:', err);
            toast.error(err.message || "Failed to remove item from cart");
        }
    };

    const updateQuantity = async (productId, quantity) => {
        try {
            const res = await fetchWithCsrf(`/api/cart/${productId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ quantity })
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || "Failed to update item quantity");
            }
            setcartItems(data.cartItems || []);
            toast.success("Cart quantity updated");
        } catch (err) {
            console.error('Failed to update item quantity:', err);
            toast.error(err.message || "Failed to update item quantity");
        }
    };

    const incrementItem = async (productId) => {
        try {
            const res = await fetchWithCsrf(`/api/cart/${productId}/increment`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || "Failed to increment item quantity");
            }
            setcartItems(data.cartItems || []);
            toast.success("Item quantity incremented");
        } catch (err) {
            console.error('Failed to increment item quantity:', err);
            toast.error(err.message || "Failed to increment item quantity");
        }
    };

    const decrementItem = async (productId) => {
        try {
            const res = await fetchWithCsrf(`/api/cart/${productId}/decrement`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || "Failed to decrement item quantity");
            }
            setcartItems(data.cartItems || []);
            toast.success("Item quantity decremented");
        } catch (err) {
            console.error('Failed to decrement item quantity:', err);
            toast.error(err.message || "Failed to decrement item quantity");
        }
    };

    const clearCart = () => {
        setcartItems([]);
        toast.info("Cart cleared");
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
                clearCart,
                loading
            }}
        >
            {children}
        </CartContext.Provider>
    );
}