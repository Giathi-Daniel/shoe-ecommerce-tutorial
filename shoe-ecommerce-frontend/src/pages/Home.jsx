import { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/products?limit=4`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await res.json();
        setFeaturedProducts(data.products || []);
      } catch (err) {
        console.error('Error loading featured products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <h2 className="mb-2 text-3xl font-bold text-primary">Featured Shoes</h2>
      <p className="mb-8 text-gray-600">
        Discover the latest in comfort and style—handpicked just for you.
      </p>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="p-4 bg-white rounded-lg shadow-md animate-pulse"
              >
                <div className="h-40 mb-4 bg-gray-300 rounded"></div>
                <div className="w-3/4 h-4 mb-2 bg-gray-200 rounded"></div>
                <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
              </div>
            ))
          : featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
      </div>

      <div className="mt-10 text-center">
        <Link
          to="/products"
          className="inline-block px-6 py-3 text-white transition rounded-full bg-accent hover:bg-accent-dark"
        >
          View All Products
        </Link>
      </div>
    </section>
  );
}