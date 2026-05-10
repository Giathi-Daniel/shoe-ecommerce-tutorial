import { Link } from 'react-router-dom';
import { memo } from 'react';
import { formatCurrency, normalizeProduct } from '../utils/productUtils.js';

function ProductCard({ product }) {
  const normalizedProduct = normalizeProduct(product);

  return (
    <div
      className="overflow-hidden transition duration-300 bg-white shadow-lg rounded-2xl hover:shadow-xl"
    >
      <img
        src={normalizedProduct.image}
        alt={normalizedProduct.name}
        loading="lazy"
        decoding="async"
        className="object-cover w-full h-56"
      />
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-800">{normalizedProduct.name}</h2>
        <p className="mt-1 text-sm font-bold text-accent">{formatCurrency(normalizedProduct.price)}</p>

        {normalizedProduct.isOnSale && (
          <span className="inline-block px-2 py-1 mt-2 mr-2 text-xs text-red-600 bg-red-100 rounded-full">
            Sale
          </span>
        )}
        {normalizedProduct.badge && (
          <span className="inline-block px-2 py-1 mt-2 text-xs text-blue-700 bg-blue-100 rounded-full">
            {normalizedProduct.badge}
          </span>
        )}

        {normalizedProduct.rating > 0 && (
          <div className="flex items-center mt-1 text-sm text-yellow-500">
            {Array.from({ length: 5 }, (_, i) => (
              <span key={i}>
                {i < Math.floor(normalizedProduct.rating) ? '★' : '☆'}
              </span>
            ))}
            <span className="ml-1 text-gray-500">({normalizedProduct.numReviews})</span>
          </div>
        )}

        <Link
          to={`/products/${normalizedProduct._id}`}
          className="block mt-3 text-sm text-primary hover:underline"
        >
          View Details 
        </Link>
      </div>
    </div>
  );
}

export default memo(ProductCard);
