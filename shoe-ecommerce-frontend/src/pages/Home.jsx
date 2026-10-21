import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import HeroCarousel from '../components/HeroCarousel';
import ProductRow from '../components/ProductRow';
import useProducts from '../hooks/useProducts';
import usePageTitle from '../hooks/usePageTitle';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { CATEGORIES, FREE_SHIPPING_THRESHOLD, formatCurrency, resizeImage } from '../utils/productUtils.js';

function TileCard({ title, children, linkLabel, to }) {
  return (
    <div className="card flex flex-col p-4">
      <h2 className="mb-3 text-xl font-bold leading-tight">{title}</h2>
      <div className="flex-1">{children}</div>
      {linkLabel && <Link to={to} className="mt-3 text-sm">{linkLabel}</Link>}
    </div>
  );
}

export default function Home() {
  usePageTitle('');
  const { user } = useAuth();
  const { itemCount, pricing } = useCart();
  const catalog = useProducts({ limit: 60, sort: 'popular' });
  const deals = useProducts({ deals: true, limit: 14, sort: 'rating' });
  const topRated = useProducts({ limit: 14, sort: 'rating', rating: 4 });

  const categoryTiles = useMemo(() => (
    CATEGORIES.map((category) => ({
      ...category,
      image: catalog.products.find((p) => p.category === category.value)?.image,
    }))
  ), [catalog.products]);

  const featured = useMemo(() => catalog.products.filter((p) => p.isFeatured).slice(0, 14), [catalog.products]);
  const newest = useMemo(() => (
    [...catalog.products].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 14)
  ), [catalog.products]);

  return (
    <>
      <HeroCarousel />

      <div className="relative z-10 mx-auto -mt-24 max-w-[1500px] space-y-4 px-3 pb-6 sm:-mt-28 sm:px-4 lg:-mt-36">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <TileCard title="Shop by department" linkLabel="Shop all shoes" to="/products">
            <div className="grid grid-cols-2 gap-3">
              {categoryTiles.slice(0, 4).map(({ label, value, image }) => (
                <Link key={value} to={`/products?category=${value}`} className="group block text-xs text-[#0f1111] hover:no-underline">
                  <div className="aspect-square overflow-hidden rounded bg-[#f0f2f2]">
                    {image ? (
                      <img src={resizeImage(image, 300)} alt="" loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
                    ) : (
                      <div className="skeleton h-full w-full" />
                    )}
                  </div>
                  <span className="mt-1 block">{label}</span>
                </Link>
              ))}
            </div>
          </TileCard>

          {user ? (
            <TileCard title={`Welcome back, ${user.name.split(' ')[0]}`} linkLabel="View your orders" to="/orders">
              <div className="space-y-3 text-sm">
                <p className="text-[#565959]">
                  {itemCount > 0
                    ? `You have ${itemCount} item${itemCount === 1 ? '' : 's'} in your cart worth ${formatCurrency(pricing.itemsPrice)}.`
                    : 'Your cart is empty. Start with today\'s deals.'}
                </p>
                <Link to={itemCount > 0 ? '/cart' : '/products?deals=true'} className="btn-cta w-full hover:text-[#0f1111]">
                  {itemCount > 0 ? 'Go to cart' : 'Browse deals'}
                </Link>
                <Link to="/wishlist" className="btn-light w-full hover:text-[#0f1111]">Your wishlist</Link>
              </div>
            </TileCard>
          ) : (
            <TileCard title="Sign in for the best experience">
              <div className="space-y-3">
                <p className="text-sm text-[#565959]">Save items to your wish list, track orders and check out faster.</p>
                <Link to="/login" className="btn-cta w-full py-2 hover:text-[#0f1111]">Sign in securely</Link>
                <p className="text-center text-xs">
                  New customer? <Link to="/signup">Create your account</Link>
                </p>
              </div>
            </TileCard>
          )}

          <TileCard title="Free delivery on orders over $50" linkLabel="Shipping details" to="/help/shipping">
            <ul className="space-y-2 text-sm text-[#565959]">
              <li>✓ Delivery in 3–5 business days</li>
              <li>✓ Free returns within 30 days</li>
              <li>✓ Secure checkout with card, PayPal or cash on delivery</li>
              <li>✓ {formatCurrency(FREE_SHIPPING_THRESHOLD)} minimum for free shipping</li>
            </ul>
          </TileCard>

          <TileCard title="Top rated this month" linkLabel="See more top rated" to="/products?sort=rating">
            <div className="grid grid-cols-2 gap-3">
              {(topRated.products.slice(0, 4).length ? topRated.products.slice(0, 4) : Array.from({ length: 4 })).map((product, i) => (
                <Link key={product?._id || i} to={product ? `/products/${product._id}` : '#'} className="block text-xs text-[#0f1111] hover:no-underline">
                  <div className="aspect-square overflow-hidden rounded bg-[#f0f2f2]">
                    {product ? <img src={resizeImage(product.image, 300)} alt="" loading="lazy" className="h-full w-full object-cover" /> : <div className="skeleton h-full w-full" />}
                  </div>
                  <span className="mt-1 block truncate">{product?.name}</span>
                </Link>
              ))}
            </div>
          </TileCard>
        </div>

        <ProductRow title="Today's Deals" products={deals.products} loading={deals.loading} seeMoreTo="/products?deals=true" />
        <ProductRow title="Best Sellers in Shoes" products={catalog.products.slice(0, 14)} loading={catalog.loading} seeMoreTo="/products?sort=popular" />

        <section className="card grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Shop by category">
          <h2 className="text-xl font-bold sm:col-span-2 lg:col-span-3">Shop by category</h2>
          {categoryTiles.map(({ value, image, full }) => (
            <Link
              key={value}
              to={`/products?category=${value}`}
              className="group relative block aspect-[16/9] overflow-hidden rounded-lg bg-[#232f3e] text-white hover:text-white hover:no-underline"
            >
              {image && (
                <img src={resizeImage(image, 700)} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-105" />
              )}
              <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <span className="absolute bottom-3 left-4 text-xl font-bold">{full}</span>
              <span className="absolute bottom-3 right-4 text-sm underline">Shop now</span>
            </Link>
          ))}
        </section>

        <ProductRow title="Featured Picks" products={featured} loading={catalog.loading} seeMoreTo="/products?featured=true" />
        <ProductRow title="New Arrivals" products={newest} loading={catalog.loading} seeMoreTo="/products?sort=newest" />
      </div>
    </>
  );
}
