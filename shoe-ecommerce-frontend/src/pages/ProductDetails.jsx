import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { HeartIcon, LockClosedIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import Breadcrumbs from '../components/Breadcrumbs';
import Price from '../components/Price';
import ProductRow from '../components/ProductRow';
import QuantitySelect from '../components/QuantitySelect';
import Reviews from '../components/Reviews';
import StarRating from '../components/StarRating';
import { PageSpinner } from '../components/Skeletons';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import usePageTitle from '../hooks/usePageTitle';
import { apiJson } from '../utils/apiFetch.jsx';
import {
  CATEGORIES,
  FREE_SHIPPING_THRESHOLD,
  formatCurrency,
  getDeliveryEstimate,
  normalizeProduct,
  resizeImage,
} from '../utils/productUtils.js';

function Gallery({ images, name }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(null);

  useEffect(() => setActive(0), [images]);

  const track = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setZoom({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
  };

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      {images.length > 1 && (
        <div className="flex gap-2 sm:flex-col" role="tablist" aria-label="Product images">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Image ${i + 1}`}
              onMouseEnter={() => setActive(i)}
              onClick={() => setActive(i)}
              className={`h-14 w-14 overflow-hidden rounded border bg-[#f7f7f7] ${i === active ? 'border-[#e77600] shadow-[0_0_3px_2px_rgba(228,121,17,.5)]' : 'border-line'}`}
            >
              <img src={resizeImage(src, 120)} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <div
        className="relative flex-1 cursor-zoom-in overflow-hidden rounded-lg bg-[#f7f7f7]"
        onMouseMove={track}
        onMouseLeave={() => setZoom(null)}
      >
        <img
          src={resizeImage(images[active], 1000)}
          alt={name}
          decoding="async"
          className="aspect-square w-full object-contain mix-blend-multiply transition-transform duration-150"
          style={zoom ? { transformOrigin: `${zoom.x}% ${zoom.y}%`, transform: 'scale(1.8)' } : undefined}
        />
      </div>
    </div>
  );
}

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [status, setStatus] = useState('loading');
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState(null);
  const [color, setColor] = useState(null);
  const [busy, setBusy] = useState(false);

  usePageTitle(product?.name);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setQuantity(1);
    setSize(null);
    setColor(null);

    apiJson(`/api/products/${id}`)
      .then((data) => {
        if (cancelled) return;
        setProduct(normalizeProduct(data.product));
        setStatus('ready');
      })
      .catch(() => !cancelled && setStatus('missing'));

    apiJson(`/api/products/${id}/related`)
      .then((data) => !cancelled && setRelated((data.products || []).map(normalizeProduct)))
      .catch(() => !cancelled && setRelated([]));

    return () => {
      cancelled = true;
    };
  }, [id]);

  const images = useMemo(
    () => (product ? [product.mainImage || product.image, ...(product.subImages || [])].filter(Boolean) : []),
    [product]
  );

  if (status === 'loading') return <PageSpinner label="Loading product" />;

  if (status === 'missing' || !product) {
    return (
      <div className="px-4 py-10">
        <EmptyState
          title="We couldn't find that product"
          action={<Link to="/products" className="btn-cta hover:text-[#0f1111]">Continue shopping</Link>}
        >
          It may have been removed or the link is incorrect.
        </EmptyState>
      </div>
    );
  }

  const category = CATEGORIES.find((c) => c.value === product.category);
  const outOfStock = product.stock === 0;
  const lowStock = product.stock > 0 && product.stock <= 5;
  const wished = isInWishlist(product._id);
  const highlights = product.description.split(/(?<=[.!?])\s+/).filter(Boolean);

  const selectedColor = color ?? (product.colors?.length === 1 ? product.colors[0] : null);
  const missingOption = product.sizes?.length && size === null ? 'size' : product.colors?.length && !selectedColor ? 'colour' : null;

  const addSelection = async () => {
    if (missingOption) {
      toast.warn(`Please select a ${missingOption}.`);
      return false;
    }
    return addToCart(product._id, quantity, { size: size ?? undefined, color: selectedColor ?? undefined });
  };

  const handleAdd = async () => {
    setBusy(true);
    await addSelection();
    setBusy(false);
  };

  const handleBuyNow = async () => {
    setBusy(true);
    const ok = await addSelection();
    setBusy(false);
    if (ok) navigate('/checkout');
  };

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-[1500px] px-3 py-4 sm:px-6">
        <Breadcrumbs
          items={[
            { label: 'Shoes', to: '/products' },
            ...(category ? [{ label: category.full, to: `/products?category=${category.value}` }] : []),
            { label: product.name },
          ]}
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)_300px] lg:gap-8">
          <Gallery images={images} name={product.name} />

          <div>
            <h1 className="text-2xl font-medium leading-snug">{product.name}</h1>
            <Link to={`/products?brand=${encodeURIComponent(product.brand)}`} className="text-sm">
              Visit the {product.brand} Store
            </Link>

            <div className="mt-1 flex items-center gap-2 text-sm">
              <span>{product.rating.toFixed(1)}</span>
              <StarRating rating={product.rating} size={17} />
              <a href="#reviews">{product.numReviews.toLocaleString()} rating{product.numReviews === 1 ? '' : 's'}</a>
            </div>

            <hr className="my-3 border-line" />

            <Price value={product.price} compareAt={product.compareAtPrice} size="lg" showDiscount />
            <p className="mt-1 text-sm text-[#565959]">
              {product.price >= FREE_SHIPPING_THRESHOLD ? 'FREE delivery and free 30-day returns.' : `Free delivery on orders over ${formatCurrency(FREE_SHIPPING_THRESHOLD)}.`}
            </p>

            <hr className="my-3 border-line" />

            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm">
              <dt className="font-bold">Brand</dt><dd>{product.brand}</dd>
              {category && (<><dt className="font-bold">Department</dt><dd>{category.full}</dd></>)}
            </dl>

            {product.colors?.length > 0 && (
              <fieldset className="mt-4">
                <legend className="mb-1 text-sm"><b>Colour:</b> {selectedColor || 'Select'}</legend>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((option) => (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={selectedColor === option}
                      onClick={() => setColor(option)}
                      className={`rounded-lg border px-3 py-1.5 text-sm ${selectedColor === option ? 'border-[#e77600] bg-[#fef8f0] shadow-[0_0_0_1px_#e77600]' : 'border-[#d5d9d9] bg-white hover:bg-[#f7fafa]'}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            {product.sizes?.length > 0 && (
              <fieldset className="mt-4">
                <legend className="mb-1 text-sm"><b>Size (US):</b> {size ?? 'Select'}</legend>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((option) => (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={size === option}
                      onClick={() => setSize(option)}
                      className={`min-w-12 rounded-lg border px-3 py-1.5 text-sm ${size === option ? 'border-[#e77600] bg-[#fef8f0] shadow-[0_0_0_1px_#e77600]' : 'border-[#d5d9d9] bg-white hover:bg-[#f7fafa]'}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </fieldset>
            )}

            <hr className="my-3 border-line" />

            <h2 className="mb-1 text-base font-bold">About this item</h2>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {highlights.map((line) => <li key={line}>{line}</li>)}
              <li>Delivered in 3–5 business days. Easy 30-day returns.</li>
            </ul>
          </div>

          <aside className="card h-fit p-4 lg:sticky lg:top-[150px]" aria-label="Buy box">
            <Price value={product.price} size="lg" />
            <p className="mt-2 text-sm">
              {product.price >= FREE_SHIPPING_THRESHOLD ? (
                <span className="font-bold text-[#007185]">FREE delivery </span>
              ) : (
                <span>Delivery </span>
              )}
              <span className="font-bold">{getDeliveryEstimate(3, 5)}</span>
            </p>
            <p className="mt-2 flex items-start gap-1 text-sm">
              <MapPinIcon className="h-4 w-4 shrink-0 translate-y-0.5 text-[#565959]" />
              <Link to={user ? '/account/settings' : '/login'}>
                {user?.address?.city ? `Deliver to ${user.name.split(' ')[0]} - ${user.address.city}` : 'Select delivery location'}
              </Link>
            </p>

            <p className={`my-3 text-lg ${outOfStock ? 'text-price' : lowStock ? 'text-[#b12704]' : 'text-[#007600]'}`}>
              {outOfStock ? 'Currently unavailable' : lowStock ? `Only ${product.stock} left in stock - order soon.` : 'In Stock'}
            </p>

            {!outOfStock && (
              <>
                <div className="mb-3 flex items-center gap-2 text-sm">
                  <label htmlFor="quantity">Quantity:</label>
                  <QuantitySelect id="quantity" value={quantity} max={product.stock} onChange={setQuantity} />
                </div>
                <div className="space-y-2">
                  <button type="button" onClick={handleAdd} disabled={busy} className="btn-cta w-full py-2">Add to Cart</button>
                  <button type="button" onClick={handleBuyNow} disabled={busy} className="btn-buy w-full py-2">Buy Now</button>
                </div>
              </>
            )}

            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs text-[#565959]">
              <dt>Ships from</dt><dd className="text-[#0f1111]">ShoeStore</dd>
              <dt>Sold by</dt><dd className="text-[#0f1111]">ShoeStore</dd>
              <dt>Returns</dt><dd className="text-link">Free 30-day returns</dd>
            </dl>
            <p className="mt-2 flex items-center gap-1 text-xs text-[#565959]">
              <LockClosedIcon className="h-3.5 w-3.5" /> Secure transaction
            </p>

            <button
              type="button"
              onClick={() => toggleWishlist(product._id)}
              aria-pressed={wished}
              className="btn-light mt-4 w-full"
            >
              {wished ? <HeartSolidIcon className="h-4 w-4 text-[#cc0c39]" /> : <HeartIcon className="h-4 w-4" />}
              {wished ? 'Saved to Wish List' : 'Add to Wish List'}
            </button>
          </aside>
        </div>

        <div className="mt-10">
          <Reviews product={product} onProductChange={(next) => setProduct(normalizeProduct(next))} />
        </div>
      </div>

      {related.length > 0 && (
        <div className="bg-[#eaeded] px-3 py-6 sm:px-6">
          <div className="mx-auto max-w-[1500px]">
            <ProductRow title="Customers also viewed" products={related} />
          </div>
        </div>
      )}
    </div>
  );
}
