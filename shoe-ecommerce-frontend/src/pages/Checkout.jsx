import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiFetch from '../utils/apiFetch.jsx';
import { formatCurrency } from '../utils/productUtils.js';

export default function Checkout() {
  const { cartItems, loading } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    address: '',
    city: '',
    postalCode: '',
    country: '',
    paymentMethod: 'cod',
  });
  const [submitting, setSubmitting] = useState(false);

  const total = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.address || !form.city || !form.postalCode || !form.country) {
      toast.error('Please fill in all shipping fields.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await apiFetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          shippingAddress: {
            address: form.address,
            city: form.city,
            postalCode: form.postalCode,
            country: form.country,
          },
          paymentMethod: form.paymentMethod,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to place order');
      toast.success('Order placed successfully!');
      navigate('/profile');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-center mt-20">Loading...</p>;

  if (!cartItems.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500">
        <p className="text-lg mb-4">Your cart is empty.</p>
        <button onClick={() => navigate('/products')} className="px-6 py-2 bg-accent text-white rounded hover:bg-rose-600">
          Shop Now
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-10">
      {/* Shipping Form */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Shipping Details</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { name: 'address', label: 'Address', placeholder: '123 Main St' },
            { name: 'city', label: 'City', placeholder: 'New York' },
            { name: 'postalCode', label: 'Postal Code', placeholder: '10001' },
            { name: 'country', label: 'Country', placeholder: 'United States' },
          ].map(({ name, label, placeholder }) => (
            <div key={name}>
              <label className="block mb-1 font-medium text-gray-700">{label}</label>
              <input
                type="text"
                name={name}
                value={form[name]}
                onChange={handleChange}
                placeholder={placeholder}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-accent"
                required
              />
            </div>
          ))}

          <div>
            <label className="block mb-1 font-medium text-gray-700">Payment Method</label>
            <select
              name="paymentMethod"
              value={form.paymentMethod}
              onChange={handleChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="cod">Cash on Delivery</option>
              <option value="paypal">PayPal (Demo)</option>
              <option value="stripe">Stripe (Demo)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 mt-2 bg-accent text-white font-semibold rounded hover:bg-rose-600 transition disabled:opacity-50"
          >
            {submitting ? 'Placing Order...' : 'Place Order'}
          </button>
        </form>
      </div>

      {/* Order Summary */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
        <div className="bg-white border rounded shadow-sm p-4 space-y-3">
          {cartItems.map(({ product, quantity }) => (
            <div key={product._id} className="flex justify-between text-sm text-gray-700">
              <span>{product.name} × {quantity}</span>
              <span>{formatCurrency(product.price * quantity)}</span>
            </div>
          ))}
          <hr />
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
