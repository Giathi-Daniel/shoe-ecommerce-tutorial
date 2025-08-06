import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from 'react-toastify';

import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!res.ok) {
          toast.error('Product not found.');
          navigate(-1); // go back if product doesn't exist
          return;
        }

        const data = await res.json();
        if (data.success) {
          setProduct(data.product);
        } else {
          toast.error('Product not found.');
          navigate(-1);
        }
      } catch (err) {
        console.error("Failed to fetch product", err);
        toast.error('Failed to fetch product. Please try again later.');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id, navigate]);

  const handleAddToCart = (productId) => {
    if (!user) {
      toast.info('Please login to add products to your cart.');
      navigate('/login'); 
      return;
    }

    try {
      addToCart(productId);
      toast.success('Product added to cart!');
    } catch (err) {
      toast.error('Failed to add product to cart.');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading product...</div>;
  }

  if (!product) {
    return <div className="p-8 text-center text-red-600">Product not found.</div>;
  }

  return (
    <section className="max-w-5xl px-4 py-12 pt-24 mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="px-4 py-2 mb-6 font-semibold transition border rounded text-primary border-primary hover:bg-primary hover:text-white"
      >
        &larr; Back
      </button>

      <div className="flex flex-col gap-6 md:flex-row">
        <div className="w-full md:w-1/2">
          <img
            src={product.image || "/placeholder.jpg"}
            alt={product.name}
            className="object-cover w-full bg-gray-200 h-96 rounded-xl"
          />
        </div>

        <div className="flex flex-col justify-between w-full md:w-1/2">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-primary">{product.name}</h1>
            <p className="mb-4 text-lg text-gray-600">{product.description}</p>
            <span className="inline-block mb-4 text-2xl font-semibold text-accent">
              ${product.price}
            </span>
          </div>

          {product.rating > 0 && (
            <div className="flex items-center mb-2">
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} className="text-lg text-yellow-500">
                  {i < Math.floor(product.rating) ? '★' : '☆'}
                </span>
              ))}
              <span className="ml-2 text-sm text-gray-600">
                {product.rating.toFixed(1)} / 5 from {product.numReviews} review{product.numReviews > 1 ? 's' : ''}
              </span>
            </div>
          )}

          {product.stock > 0 ? (
            <p className="text-green-600">In Stock</p>
          ) : (
            <p className="text-red-500">Out of Stock</p>
          )}

          <div className="mt-12">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">Customer Reviews</h2>

            {product.reviews && product.reviews.length > 0 ? (
              <div className="space-y-6">
                {product.reviews.map((review, idx) => (
                  <div key={idx} className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center mb-2">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span key={i} className="text-sm text-yellow-500">
                          {i < review.rating ? '★' : '☆'}
                        </span>
                      ))}
                    </div>
                    <p className="mb-1 text-sm text-gray-700">{review.comment}</p>
                    <span className="text-xs text-gray-500">By {review.name} • {new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No reviews yet.</p>
            )}
          </div>

          <button
            className="px-6 py-3 mt-4 font-semibold text-white rounded-lg bg-primary hover:bg-opacity-90"
            onClick={() => handleAddToCart(product._id)}
            disabled={product.stock === 0}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </section>
  );
}