const FALLBACK_IMAGE = '/placeholder.svg';

export const FREE_SHIPPING_THRESHOLD = 50;
export const FLAT_SHIPPING_RATE = 5.99;
export const TAX_RATE = 0.08;
export const MAX_CART_QUANTITY = 10;

export const CATEGORIES = [
  { label: 'Men', value: 'men', full: "Men's Shoes" },
  { label: 'Women', value: 'women', full: "Women's Shoes" },
  { label: 'Kids', value: 'kids', full: "Kids' Shoes" },
  { label: 'Sports', value: 'sports', full: 'Sports Shoes' },
  { label: 'Casual', value: 'casual', full: 'Casual Shoes' },
  { label: 'Formal', value: 'formal', full: 'Formal Shoes' },
];

export const SORT_OPTIONS = [
  { label: 'Featured', value: '' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Avg. Customer Review', value: 'rating' },
  { label: 'Newest Arrivals', value: 'newest' },
  { label: 'Best Sellers', value: 'popular' },
];

export const ORDER_STEPS = ['pending', 'processing', 'shipped', 'delivered'];

export const needsOptions = (product) => Boolean(product?.sizes?.length || product?.colors?.length);

export function variantLabel({ size, color } = {}) {
  return [size && `Size ${size}`, color].filter(Boolean).join(' · ');
}

export function getProductId(product) {
  if (!product) return '';
  return String(product._id || product.id || product.productId || '');
}

export function getProductImage(product) {
  return product?.image || product?.mainImage || FALLBACK_IMAGE;
}

export function resizeImage(url, width = 600) {
  if (!url || !url.includes('images.unsplash.com')) return url;
  return url.replace(/w=\d+/, `w=${width}`);
}

export function formatCurrency(value, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(value) || 0);
}

export function splitPrice(value) {
  const [whole, fraction] = (Number(value) || 0).toFixed(2).split('.');
  return { whole: Number(whole).toLocaleString('en-US'), fraction };
}

export function formatDate(value, options = { year: 'numeric', month: 'long', day: 'numeric' }) {
  return value ? new Date(value).toLocaleDateString('en-US', options) : '';
}

export function getDeliveryEstimate(daysFrom = 3, daysTo = 5, from = new Date()) {
  const format = (days) => {
    const date = new Date(from);
    date.setDate(date.getDate() + days);
    return formatDate(date, { weekday: 'long', month: 'long', day: 'numeric' });
  };
  return daysFrom === daysTo ? format(daysFrom) : `${format(daysFrom)} - ${format(daysTo)}`;
}

const roundMoney = (value) => Math.round(value * 100) / 100;

export function calculatePricing(items) {
  const itemsPrice = roundMoney(items.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0));
  const shippingPrice = itemsPrice === 0 || itemsPrice >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_RATE;
  const taxPrice = roundMoney(itemsPrice * TAX_RATE);

  return {
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalAmount: roundMoney(itemsPrice + shippingPrice + taxPrice),
    amountToFreeShipping: Math.max(roundMoney(FREE_SHIPPING_THRESHOLD - itemsPrice), 0),
  };
}

export function normalizeProduct(product = {}) {
  const price = Number(product.price) || 0;
  const compareAtPrice = Number(product.compareAtPrice) || 0;

  return {
    ...product,
    _id: getProductId(product),
    image: getProductImage(product),
    price,
    compareAtPrice,
    discountPercent: compareAtPrice > price ? Math.round((1 - price / compareAtPrice) * 100) : 0,
    rating: Number(product.rating) || 0,
    numReviews: Number(product.numReviews) || 0,
    stock: Number(product.stock) || 0,
  };
}

export function normalizeWishlistItem(item = {}) {
  const product = typeof item.productId === 'object' && item.productId !== null
    ? normalizeProduct(item.productId)
    : normalizeProduct(item);
  const id = getProductId(product) || String(item.productId || '');

  return {
    ...product,
    _id: id,
    productId: id,
    name: product.name || item.name || 'Product',
    image: product.image !== FALLBACK_IMAGE ? product.image : item.image || FALLBACK_IMAGE,
    price: Number(product.price ?? item.price) || 0,
  };
}

export function normalizeCartItem(item = {}) {
  return {
    ...item,
    product: normalizeProduct(item.product || item.productId || {}),
    quantity: Number(item.quantity) || 1,
  };
}
