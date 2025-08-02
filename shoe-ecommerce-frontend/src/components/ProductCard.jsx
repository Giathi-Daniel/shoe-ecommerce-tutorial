import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function ProductCard({ product }) {
  return (
    <motion.div
      className="overflow-hidden transition duration-300 bg-white shadow-lg rounded-2xl hover:shadow-xl"
      whileHover={{ scale: 1.03 }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <img
        src={product.image || '/placeholder.jpg'}
        alt={product.name}
        className="object-cover w-full h-56"
      />
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-800">{product.name}</h2>
        <p className="mt-1 text-sm font-bold text-accent">${product.price}</p>

        {product.isOnSale && (
          <span className="inline-block px-2 py-1 mt-2 mr-2 text-xs text-red-600 bg-red-100 rounded-full">
            Sale
          </span>
        )}
        {product.badge && (
          <span className="inline-block px-2 py-1 mt-2 text-xs text-blue-700 bg-blue-100 rounded-full">
            {product.badge}
          </span>
        )}

        <Link
          to={`/products/${product._id}`}
          className="block mt-3 text-sm text-primary hover:underline"
        >
          View Details 
        </Link>
      </div>
    </motion.div>
  );
}
