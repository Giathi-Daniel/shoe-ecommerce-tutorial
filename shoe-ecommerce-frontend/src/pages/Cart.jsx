import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import EmptyState from '../components/EmptyState';
import ConfirmDialog from '../components/ConfirmDialog';
import Price from '../components/Price';
import { FreeShippingProgress } from '../components/OrderSummaryBox';
import { PageSpinner } from '../components/Skeletons';
import usePageTitle from '../hooks/usePageTitle';
import { MAX_CART_QUANTITY, formatCurrency, resizeImage, variantLabel } from '../utils/productUtils.js';

export default function Cart() {
  usePageTitle('Shopping Cart');
  const navigate = useNavigate();
  const { cartItems, loading, itemCount, pricing, updateQuantity, removeFromCart, clearCart } = useCart();
  const { isInWishlist, addToWishlist } = useWishlist();
  const [pendingId, setPendingId] = useState(null);
  const [confirmClear, setConfirmClear] = useState(false);

  if (loading) return <PageSpinner label="Loading your cart" />;

  if (!cartItems.length) {
    return (
      <div className="px-4 py-10">
        <EmptyState
          icon={ShoppingCartIcon}
          title="Your ShoeStore Cart is empty"
          action={<Link to="/products" className="btn-cta hover:text-[#0f1111]">Continue shopping</Link>}
        >
          Your cart lives to serve. Fill it with shoes, then check out when you&apos;re ready.
        </EmptyState>
      </div>
    );
  }

  const run = async (lineId, action) => {
    setPendingId(lineId);
    await action();
    setPendingId(null);
  };

  const subtotalLabel = `Subtotal (${itemCount} item${itemCount === 1 ? '' : 's'}):`;

  const checkoutBox = (
    <div className="card h-fit space-y-3 p-4 lg:sticky lg:top-[150px]">
      <FreeShippingProgress pricing={pricing} />
      <p className="text-lg">
        {subtotalLabel} <span className="font-bold">{formatCurrency(pricing.itemsPrice)}</span>
      </p>
      <button type="button" onClick={() => navigate('/checkout')} className="btn-cta w-full py-2">
        Proceed to checkout
      </button>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1500px] px-3 py-4 sm:px-4">
      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="order-2 lg:order-1">
          <section className="card p-4 sm:p-6" aria-labelledby="cart-heading">
            <div className="flex items-end justify-between border-b border-line pb-2">
              <h1 id="cart-heading" className="text-2xl font-medium sm:text-[28px]">Shopping Cart</h1>
              <span className="hidden text-sm text-[#565959] sm:block">Price</span>
            </div>

            <ul>
              {cartItems.map(({ _id: lineId, product, quantity, size, color }) => {
                const busy = pendingId === lineId;
                const maxQuantity = Math.min(product.stock || MAX_CART_QUANTITY, MAX_CART_QUANTITY);

                return (
                  <li key={lineId} className={`flex gap-4 border-b border-line py-4 last:border-0 ${busy ? 'opacity-60' : ''}`}>
                    <Link to={`/products/${product._id}`} className="shrink-0">
                      <img
                        src={resizeImage(product.image, 300)}
                        alt={product.name}
                        className="h-28 w-28 rounded bg-[#f7f7f7] object-contain mix-blend-multiply sm:h-44 sm:w-44"
                      />
                    </Link>

                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex justify-between gap-3">
                        <Link to={`/products/${product._id}`} className="text-base font-medium text-[#0f1111] hover:text-link-hover sm:text-lg">
                          {product.name}
                        </Link>
                        <div className="hidden text-lg font-bold sm:block">{formatCurrency(product.price)}</div>
                      </div>

                      <p className={`text-xs ${product.stock > 0 ? 'text-[#007600]' : 'text-price'}`}>
                        {product.stock > 0 ? (product.stock <= 5 ? `Only ${product.stock} left in stock` : 'In Stock') : 'Out of stock'}
                      </p>
                      {variantLabel({ size, color }) && <p className="text-sm text-[#565959]">{variantLabel({ size, color })}</p>}
                      <p className="text-xs text-[#565959]">Free 30-day returns · Sold by ShoeStore</p>
                      <div className="sm:hidden"><Price value={product.price} size="sm" /></div>

                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
                        <select
                          value={quantity}
                          disabled={busy}
                          aria-label={`Quantity for ${product.name}`}
                          onChange={(e) => {
                            const next = Number(e.target.value);
                            run(lineId, () => (next === 0 ? removeFromCart(lineId) : updateQuantity(lineId, next)));
                          }}
                          className="rounded-lg border border-[#d5d9d9] bg-[#f0f2f2] px-2 py-1 shadow-sm hover:bg-[#e3e6e6]"
                        >
                          <option value={0}>0 (Delete)</option>
                          {Array.from({ length: Math.max(maxQuantity, quantity) }, (_, i) => i + 1).map((n) => (
                            <option key={n} value={n}>{n}</option>
                          ))}
                        </select>
                        <span className="text-line" aria-hidden="true">|</span>
                        <button type="button" disabled={busy} onClick={() => run(lineId, () => removeFromCart(lineId))} className="text-link hover:text-link-hover hover:underline">
                          Delete
                        </button>
                        {!isInWishlist(product._id) && (
                          <>
                            <span className="text-line" aria-hidden="true">|</span>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => run(lineId, async () => (await addToWishlist(product._id)) && removeFromCart(lineId))}
                              className="text-link hover:text-link-hover hover:underline"
                            >
                              Save for later
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="flex items-center justify-between border-t border-line pt-3">
              <button type="button" onClick={() => setConfirmClear(true)} className="text-sm text-link hover:underline">
                Empty cart
              </button>
              <p className="text-lg">
                {subtotalLabel} <span className="font-bold">{formatCurrency(pricing.itemsPrice)}</span>
              </p>
            </div>
          </section>
        </div>

        <div className="order-1 lg:order-2">{checkoutBox}</div>
      </div>

      <ConfirmDialog
        open={confirmClear}
        title="Empty your cart?"
        confirmLabel="Empty cart"
        danger
        onClose={() => setConfirmClear(false)}
        onConfirm={async () => {
          await clearCart();
          setConfirmClear(false);
        }}
      >
        All {itemCount} items will be removed from your cart.
      </ConfirmDialog>
    </div>
  );
}
