import { useCart } from "../context/CartContext";
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom"; 
import { formatCurrency } from "../utils/productUtils.js";

export default function Cart() {
  const { cartItems, removeFromCart, loading, incrementItem, decrementItem, updateQuantity } = useCart();
  const navigate = useNavigate();

  const [localQuantities, setLocalQuantities] = useState({});
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [showModal, setShowModal] = useState(false); 
  const [itemToRemove, setItemToRemove] = useState(null);

  const timers = useRef({});

  useEffect(() => {
    const quantities = {};
    cartItems.forEach(({ product, quantity }) => {
      quantities[product._id] = quantity;
    });
    setLocalQuantities(quantities);
    setIsInitialLoad(false); 
  }, [cartItems]);

  useEffect(() => {
    if (isInitialLoad) return; 

    const activeTimers = timers.current;

    Object.entries(localQuantities).forEach(([productId, qty]) => {
      if (activeTimers[productId]) {
        clearTimeout(activeTimers[productId]);
      }

      if (qty !== "" && qty > 0) {
        activeTimers[productId] = setTimeout(() => {
          const cartItem = cartItems.find(item => item.product._id === productId);
          if (cartItem && qty !== cartItem.quantity) {
            updateQuantity(productId, qty);
          }
        }, 500);
      }
    });

    return () => {
      Object.values(activeTimers).forEach(clearTimeout);
    };
  }, [localQuantities, updateQuantity, cartItems, isInitialLoad]);

  const handleInputChange = (productId, value) => {
    if (value === "") {
      setLocalQuantities(prev => ({ ...prev, [productId]: "" }));
      return;
    }

    const parsed = parseInt(value, 10);
    if (isNaN(parsed) || parsed < 1) return;

    setLocalQuantities(prev => ({ ...prev, [productId]: parsed }));
  };

  const total = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity, 0
  );

  const handleRemoveItem = (productId) => {
    setItemToRemove(productId);
    setShowModal(true);
  };

  const confirmRemoveItem = () => {
    removeFromCart(itemToRemove);
    setShowModal(false);
    setItemToRemove(null);
  };

  const containerClass = "max-w-4xl px-4 py-10 mx-auto";
  const emptyCartClass = "flex flex-col items-center justify-center text-center text-gray-500 min-h-[60vh] animate-fadeIn";
  const cartItemClass = "flex flex-col md:flex-row items-center justify-between p-4 mb-4 border rounded";
  
  const bounceIconClass = "w-16 h-16 mb-4 text-gray-400 animate-bounce"; // Bouncing animation

  if (loading) return <p className="text-center">Loading cart...</p>;

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className={emptyCartClass}>
        <svg className={bounceIconClass} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13v6a2 2 0 002 2h8a2 2 0 002-2v-6" />
        </svg>
        <p className="mb-4 text-lg">Your cart is empty.</p>
        <Link
          to="/products"
          className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <h2 className="mb-6 text-2xl font-bold text-center md:text-left">Your Cart</h2>

      {cartItems.map(({ product, quantity }) => (
        <div
          key={product._id}
          className={cartItemClass}
        >
          <div className="flex-1 mb-4 md:mb-0">
            <h3 className="font-semibold mb-2">{product.name}</h3>
            <div className="flex items-center gap-2">
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
                value={localQuantities[product._id] ?? quantity}
                onChange={(e) => handleInputChange(product._id, e.target.value)}
                className="w-16 p-1 text-center border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
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
            <p className="mt-2 font-bold text-accent">{formatCurrency(product.price)}</p>
          </div>

          <button
            className="mt-4 md:mt-0 text-sm text-red-500 hover:underline"
            onClick={() => handleRemoveItem(product._id)}
          >
            Remove
          </button>
        </div>
      ))}

      <div className="mt-8 flex flex-col md:flex-row items-center justify-between">
        <p className="text-lg font-semibold mb-4 md:mb-0">
          Total: {formatCurrency(total)}
        </p>
        <button
          disabled={cartItems.length === 0}
          onClick={() => navigate('/checkout')}
          className={`px-6 py-2 rounded text-white transition ${
            cartItems.length === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-accent hover:bg-rose-600"
          }`}
        >
          Proceed to Checkout
        </button>
      </div>

      {/* Modal for confirming item removal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50 animate-fadeIn">
          <div className="bg-white p-6 rounded shadow-lg w-1/3">
            <h3 className="text-lg font-semibold mb-4">Are you sure you want to remove this item?</h3>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemoveItem}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
