const FALLBACK_IMAGE = '/placeholder.jpg';

export function getProductId(product) {
  if (!product) return '';
  return String(product._id || product.id || product.productId || '');
}

export function getProductImage(product) {
  return product?.image || product?.mainImage || FALLBACK_IMAGE;
}

export function formatCurrency(value, currency = 'USD') {
  const amount = Number(value) || 0;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function normalizeProduct(product = {}) {
  const productId = getProductId(product);

  return {
    ...product,
    _id: productId,
    image: getProductImage(product),
    price: Number(product.price) || 0,
    rating: Number(product.rating) || 0,
    numReviews: Number(product.numReviews) || 0,
  };
}

export function normalizeWishlistItem(item = {}) {
  const product = typeof item.productId === 'object' && item.productId !== null
    ? normalizeProduct(item.productId)
    : normalizeProduct(item);

  return {
    ...product,
    _id: getProductId(product) || String(item.productId || ''),
    productId: getProductId(product) || String(item.productId || ''),
    name: product.name || item.name || 'Product',
    image: getProductImage(product) || item.image || FALLBACK_IMAGE,
    price: Number(product.price ?? item.price) || 0,
  };
}

export function normalizeCartItem(item = {}) {
  const product = normalizeProduct(item.product || item.productId || {});

  return {
    ...item,
    product,
    quantity: Number(item.quantity) || 1,
  };
}
