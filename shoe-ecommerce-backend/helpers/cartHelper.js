const Cart = require('../models/Cart');
const Product = require('../models/Product');

const MAX_QUANTITY_PER_ITEM = 10;

const saveAndPopulateCart = async (cart) => {
  await cart.save();
  await cart.populate('items.productId');

  const available = cart.items.filter((item) => item.productId);
  if (available.length !== cart.items.length) {
    cart.items = available;
    await cart.save();
    await cart.populate('items.productId');
  }
  return cart;
};

const getOrCreateCart = async (userId) => {
  const cart = await Cart.findOne({ userId });
  return cart || Cart.create({ userId, items: [] });
};

const findCartLine = (cart, productId, size, color) =>
  cart.items.find(
    (i) => i.productId?.toString() === productId.toString() && (i.size ?? null) === (size ?? null) && (i.color ?? null) === (color ?? null)
  );

// Stock is tracked per product, so quantity across every size/colour line counts against it
const availableFor = (cart, product, excludeLineId) => {
  const inOtherLines = cart.items
    .filter((i) => i.productId?.toString() === product._id.toString() && i.id !== excludeLineId)
    .reduce((sum, i) => sum + i.quantity, 0);
  return Math.max(0, Math.min(MAX_QUANTITY_PER_ITEM - inOtherLines, product.stock - inOtherLines));
};

const validateVariant = (product, size, color) => {
  if (product.sizes.length && !product.sizes.includes(size)) return 'Please select a size';
  if (product.colors.length && !product.colors.includes(color)) return 'Please select a colour';
  return null;
};

const isValidQuantity = (quantity) => Number.isInteger(quantity) && quantity > 0;

module.exports = {
  MAX_QUANTITY_PER_ITEM,
  saveAndPopulateCart,
  getOrCreateCart,
  findCartLine,
  availableFor,
  validateVariant,
  isValidQuantity,
};
