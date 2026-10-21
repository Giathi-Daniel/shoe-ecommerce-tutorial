import { Link } from 'react-router-dom';
import { HeartIcon } from '@heroicons/react/24/outline';
import EmptyState from '../components/EmptyState';
import Price from '../components/Price';
import StarRating from '../components/StarRating';
import { PageSpinner } from '../components/Skeletons';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import usePageTitle from '../hooks/usePageTitle';
import { needsOptions, resizeImage } from '../utils/productUtils.js';

export default function Wishlist() {
  usePageTitle('Your Wish List');
  const { wishlistItems, loading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (loading) return <PageSpinner label="Loading your wish list" />;

  if (!wishlistItems.length) {
    return (
      <div className="px-4 py-10">
        <EmptyState
          icon={HeartIcon}
          title="Your Wish List is empty"
          action={<Link to="/products" className="btn-cta hover:text-[#0f1111]">Discover shoes</Link>}
        >
          Tap the heart on any product to save it here for later.
        </EmptyState>
      </div>
    );
  }

  const moveToCart = async (item) => {
    if (await addToCart(item.productId)) removeFromWishlist(item.productId);
  };

  return (
    <div className="mx-auto max-w-[1000px] px-3 py-4 sm:px-4">
      <h1 className="mb-3 text-[28px] font-medium">Your Wish List <span className="text-base text-[#565959]">({wishlistItems.length})</span></h1>

      <ul className="card divide-y divide-line">
        {wishlistItems.map((item) => (
          <li key={item.productId} className="flex flex-col gap-4 p-4 sm:flex-row">
            <Link to={`/products/${item.productId}`} className="shrink-0 self-start">
              <img src={resizeImage(item.image, 300)} alt={item.name} loading="lazy" className="h-36 w-36 rounded bg-[#f7f7f7] object-contain mix-blend-multiply" />
            </Link>

            <div className="flex-1 space-y-1">
              <Link to={`/products/${item.productId}`} className="text-lg font-medium text-[#0f1111] hover:text-link-hover">{item.name}</Link>
              {item.numReviews > 0 && <div className="flex items-center gap-1 text-sm"><StarRating rating={item.rating} size={14} /> <span className="text-link">{item.numReviews}</span></div>}
              <Price value={item.price} compareAt={item.compareAtPrice} />
              <p className={`text-sm ${item.stock === 0 ? 'text-price' : 'text-[#007600]'}`}>
                {item.stock === 0 ? 'Currently unavailable' : 'In Stock'}
              </p>
            </div>

            <div className="flex gap-2 sm:w-52 sm:flex-col">
              {needsOptions(item) ? (
                <Link to={`/products/${item.productId}`} className="btn-cta flex-1 hover:text-[#0f1111]">Select options</Link>
              ) : (
                <>
                  <button type="button" disabled={item.stock === 0} onClick={() => addToCart(item.productId)} className="btn-cta flex-1">Add to Cart</button>
                  <button type="button" disabled={item.stock === 0} onClick={() => moveToCart(item)} className="btn-light flex-1">Move to Cart</button>
                </>
              )}
              <button type="button" onClick={() => removeFromWishlist(item.productId)} className="btn-light flex-1">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
