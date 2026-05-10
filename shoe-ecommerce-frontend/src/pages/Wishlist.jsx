import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/productUtils.js';

export default function Wishlist() {
  const { wishlistItems, loading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (loading) return <p className="text-center mt-20">Loading wishlist...</p>;

  if (!wishlistItems.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500 text-center">
        <svg className="w-16 h-16 mb-4 animate-bounce text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
        </svg>
        <p className="mb-4 text-lg">Your wishlist is empty.</p>
        <Link to="/products" className="px-6 py-3 bg-accent text-white rounded hover:bg-rose-600 transition">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold mb-6">My Wishlist</h2>
      <div className="grid gap-4">
        {wishlistItems.map((item) => (
          <div key={item.productId} className="flex items-center justify-between p-4 border rounded bg-white shadow-sm">
            <div className="flex items-center gap-4">
              <img
                src={item.image}
                alt={item.name}
                loading="lazy"
                decoding="async"
                className="w-16 h-16 object-cover rounded"
              />
              <div>
                <p className="font-semibold text-gray-800">{item.name}</p>
                <p className="text-accent font-bold">{formatCurrency(item.price)}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => addToCart(item.productId)}
                className="px-4 py-2 text-sm bg-primary text-white rounded hover:bg-secondary transition"
              >
                Add to Cart
              </button>
              <button
                onClick={() => removeFromWishlist(item.productId)}
                className="px-4 py-2 text-sm text-red-500 border border-red-300 rounded hover:bg-red-50 transition"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
