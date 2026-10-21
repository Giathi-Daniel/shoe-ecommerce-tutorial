import { memo } from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import StarRating from './StarRating';
import Price from './Price';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { getDeliveryEstimate, needsOptions, normalizeProduct, resizeImage, FREE_SHIPPING_THRESHOLD } from '../utils/productUtils.js';

function ProductCard({ product, compact = false }) {
  const item = normalizeProduct(product);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const wished = isInWishlist(item._id);
  const outOfStock = item.stock === 0;

  return (
    <article className="card group relative flex h-full flex-col overflow-hidden transition hover:shadow-pop">
      <button
        type="button"
        onClick={() => toggleWishlist(item._id)}
        aria-pressed={wished}
        aria-label={wished ? `Remove ${item.name} from wishlist` : `Add ${item.name} to wishlist`}
        className="absolute right-2 top-2 z-10 rounded-full bg-white/90 p-1.5 shadow transition hover:scale-110"
      >
        {wished ? <HeartSolidIcon className="h-5 w-5 text-[#cc0c39]" /> : <HeartIcon className="h-5 w-5 text-[#565959]" />}
      </button>

      <Link to={`/products/${item._id}`} className="block bg-[#f7f7f7] p-3 hover:no-underline">
        <img
          src={resizeImage(item.image, 500)}
          alt={item.name}
          loading="lazy"
          decoding="async"
          className="aspect-square w-full object-contain mix-blend-multiply transition duration-300 group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-3">
        {item.discountPercent >= 15 && (
          <span className="w-fit rounded bg-[#cc0c39] px-1.5 py-0.5 text-xs font-bold text-white">
            {item.discountPercent}% off
          </span>
        )}

        <Link to={`/products/${item._id}`} className="text-[15px] leading-snug text-[#0f1111] hover:text-link-hover">
          <span className="line-clamp-2-safe">{item.name}</span>
        </Link>
        <span className="text-xs text-[#565959]">{item.brand}</span>

        {item.numReviews > 0 && (
          <div className="flex items-center gap-1 text-sm">
            <StarRating rating={item.rating} size={14} />
            <span className="text-link">{item.numReviews.toLocaleString()}</span>
          </div>
        )}

        <Price value={item.price} compareAt={item.compareAtPrice} />

        {!compact && (
          <p className="text-xs text-[#565959]">
            {item.price >= FREE_SHIPPING_THRESHOLD ? (
              <>
                <span className="font-bold text-[#007185]">FREE delivery</span> {getDeliveryEstimate(3, 3)}
              </>
            ) : (
              <>Get it by {getDeliveryEstimate(3, 3)}</>
            )}
          </p>
        )}

        <div className="mt-auto pt-2">
          {outOfStock ? (
            <p className="py-1.5 text-center text-sm text-price">Currently unavailable</p>
          ) : needsOptions(item) ? (
            <Link to={`/products/${item._id}`} className="btn-cta w-full hover:text-[#0f1111]">
              Select options
            </Link>
          ) : (
            <button type="button" onClick={() => addToCart(item._id)} className="btn-cta w-full">
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default memo(ProductCard);
