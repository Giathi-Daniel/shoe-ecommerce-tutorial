import { useCart } from "../context/CartContext";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom"; 
import { useRef } from "react";


export default function Cart() {
    const { cartItems, removeFromCart, loading, incrementItem, decrementItem, updateQuantity } = useCart();

    // Local state to hold editable quantities, keyed by productId
    const [localQuantities, setLocalQuantities] = useState({});

    // Initialize localQuantities when cartItems change
    useEffect(() => {
        const quantities = {};
        cartItems.forEach(({ product, quantity }) => {
            quantities[product._id] = quantity;
        });
        setLocalQuantities(quantities);
    }, [cartItems]);

    // Debounce updateQuantity calls per product
    const timers = useRef({});

    useEffect(() => {
        Object.entries(localQuantities).forEach(([productId, qty]) => {
            if (timers.current[productId]) {
                clearTimeout(timers.current[productId]);
            }

            timers.current[productId] = setTimeout(() => {
                const cartItem = cartItems.find(item => item.product._id === productId);
                if (cartItem && qty !== cartItem.quantity && qty > 0) {
                    updateQuantity(productId, qty);
                }
            }, 500);
        });

        return () => {
            Object.values(timers.current).forEach(clearTimeout);
        };
    }, [localQuantities, updateQuantity, cartItems]);


    const handleInputChange = (productId, value) => {
        const parsed = parseInt(value, 10);
        if (isNaN(parsed) || parsed < 1) return; 
        setLocalQuantities(prev => ({ ...prev, [productId]: parsed }));
    };

    const total = cartItems.reduce(
        (acc, item) => acc + item.product.price * item.quantity, 0
    );

    // Fallback to loading or empty message
    if (loading) return <p className="text-center">Loading cart...</p>;

    if (!cartItems || cartItems.length === 0) {
        return (
            <div className="text-center text-gray-500">
                <p>Your cart is empty.</p>
                <Link to="/products" className="inline-block mt-4 text-blue-500 hover:text-blue-700">
                    Back to Shop
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl px-4 py-10 mx-auto">
            <h2 className="mb-6 text-2xl font-bold">Your Cart</h2>

            {cartItems.map(({ product, quantity }) => (
                <div
                    key={product._id}
                    className="flex items-center justify-between p-4 mb-4 border rounded"
                >
                    <div>
                        <h3 className="font-semibold">{product.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <button
                                onClick={() => decrementItem(product._id)}
                                className="px-2 py-1 text-white bg-gray-600 rounded hover:bg-gray-700"
                                aria-label={`Decrease quantity of ${product.name}`}
                            >
                                -
                            </button>

                            <input
                                type="number"
                                min="1"
                                value={localQuantities[product._id] || quantity}
                                onChange={(e) => handleInputChange(product._id, e.target.value)}
                                className="w-12 p-1 text-center border rounded"
                                aria-label={`Quantity of ${product.name}`}
                            />

                            <button
                                onClick={() => incrementItem(product._id)}
                                className="px-2 py-1 text-white bg-gray-600 rounded hover:bg-gray-700"
                                aria-label={`Increase quantity of ${product.name}`}
                            >
                                +
                            </button>
                        </div>
                        <p className="mt-1 font-bold text-accent">${product.price}</p>
                    </div>

                    <button
                        className="text-sm text-red-500 hover:underline"
                        onClick={() => removeFromCart(product._id)}
                    >
                        Remove
                    </button>
                </div>
            ))}

            <div className="mt-6 text-right">
                <p className="text-lg font-semibold">Total: ${total.toFixed(2)}</p>
                <button className="px-6 py-2 mt-4 text-white rounded bg-accent">
                    Proceed to Checkout
                </button>
            </div>
        </div>
    );
}