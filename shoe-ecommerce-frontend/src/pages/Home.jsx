import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { Link } from 'react-router-dom';
import useProducts from '../hooks/useProducts';

export default function Home() {
  const [loading, setLoading] = useState(true);

  const { products: featuredProducts, loading: productsLoading } = useProducts({
    limit: 4, 
  });

  useEffect(() => {
    if (!productsLoading) {
      setLoading(false);
    }
  }, [productsLoading]);

  return (
    <section className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="relative p-8 mb-12 bg-gray-100 rounded-lg">
        <h1 className="mb-4 text-4xl font-bold text-primary">
          Discover Comfort and Style with Our Latest Shoes
        </h1>
        <p className="mb-6 text-xl text-gray-700">
          Shop now for the best in comfort, style, and durability.
        </p>
        <Link
          to="/products"
          className="inline-block px-6 py-3 text-white transition rounded-full bg-accent hover:bg-accent-dark"
        >
          Explore Now
        </Link>
      </div>

      {/* Featured Products */}
      <h2 className="mb-2 text-3xl font-bold text-primary">Featured Shoes</h2>
      <p className="mb-8 text-gray-600">
        Discover the latest in comfort and style—handpicked just for you.
      </p>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {loading || productsLoading
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
          : featuredProducts.map((product, idx) => (
              <ProductCard key={`${product._id}-${idx}`} product={product} />
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

      {/* Categories Section */}
      <section className="mt-16">
        <h2 className="mb-6 text-3xl font-bold text-primary">Shop by Category</h2>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="p-8 text-center bg-gray-200 rounded-lg category-card">
            <h3 className="mb-4 text-xl font-semibold text-primary">Sneakers</h3>
            <Link to="/" className="text-accent hover:text-accent-dark">
              Shop Now
            </Link>
          </div>
          <div className="p-8 text-center bg-gray-200 rounded-lg category-card">
            <h3 className="mb-4 text-xl font-semibold text-primary">Boots</h3>
            <Link to="/" className="text-accent hover:text-accent-dark">
              Shop Now
            </Link>
          </div>
          <div className="p-8 text-center bg-gray-200 rounded-lg category-card">
            <h3 className="mb-4 text-xl font-semibold text-primary">Sandals</h3>
            <Link to="/" className="text-accent hover:text-accent-dark">
              Shop Now
            </Link>
          </div>
          <div className="p-8 text-center bg-gray-200 rounded-lg category-card">
            <h3 className="mb-4 text-xl font-semibold text-primary">Casual</h3>
            <Link to="/" className="text-accent hover:text-accent-dark">
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* Promotions Banner */}
      <section className="p-8 mt-16 text-center text-white bg-accent">
        <h2 className="mb-4 text-3xl font-bold">Summer Sale - Up to 50% Off!</h2>
        <p className="mb-6 text-xl">Hurry up, limited time offer!</p>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-white rounded-full text-accent hover:bg-accent-dark"
        >
          Shop Sale
        </Link>
      </section>

      {/* Testimonials Section */}
      <section className="mt-16 text-center">
        <h2 className="mb-6 text-3xl font-bold text-primary">What Our Customers Say</h2>
        <div className="space-y-4">
          <blockquote className="text-xl italic text-gray-600">
            "The best pair of sneakers I've ever bought. Super comfy and stylish!"
          </blockquote>
          <blockquote className="text-xl italic text-gray-600">
            "Fast delivery and amazing quality. Highly recommend!"
          </blockquote>
        </div>
      </section>
    </section>
  );
}