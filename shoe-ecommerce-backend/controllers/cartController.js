const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { calculateTotal } = require('../utils/cartUtils');
const {
  getOrCreateCart,
  saveAndPopulateCart,
  findCartLine,
  availableFor,
  validateVariant,
  isValidQuantity,
} = require('../helpers/cartHelper');

const respond = async (res, cart) => {
  await saveAndPopulateCart(cart);
  res.status(200).json({ success: true, cart, total: calculateTotal(cart) });
};

// GET /api/cart
exports.getCart = async (req, res, next) => {
  try {
    await respond(res, await getOrCreateCart(req.user.id));
  } catch (err) {
    next(err);
  }
};

// POST /api/cart  { productId, quantity, size, color }
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, size, color } = req.body;
    const quantity = req.body.quantity === undefined ? 1 : req.body.quantity;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid product id' });
    }
    if (!isValidQuantity(quantity)) {
      return res.status(400).json({ message: 'Invalid quantity value' });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.stock < 1) return res.status(400).json({ message: `${product.name} is out of stock` });

    const variantError = validateVariant(product, size, color);
    if (variantError) return res.status(400).json({ message: variantError });

    const cart = await getOrCreateCart(req.user.id);
    const line = findCartLine(cart, productId, size, color);
    const available = availableFor(cart, product, line?.id);

    if (available < 1) {
      return res.status(400).json({ message: `You already have the maximum available quantity of ${product.name}` });
    }

    if (line) {
      line.quantity = Math.min(line.quantity + quantity, available);
    } else {
      cart.items.push({ productId, size, color, quantity: Math.min(quantity, available) });
    }

    await respond(res, cart);
  } catch (err) {
    next(err);
  }
};

// PATCH|PUT /api/cart/:itemId  { quantity }
exports.updateQuantity = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    if (!isValidQuantity(quantity)) {
      return res.status(400).json({ message: 'Invalid quantity value' });
    }

    const cart = await Cart.findOne({ userId: req.user.id });
    const line = cart?.items.id(req.params.itemId);
    if (!line) return res.status(404).json({ message: 'Item not found' });

    const product = await Product.findById(line.productId);
    line.quantity = product ? Math.max(Math.min(quantity, availableFor(cart, product, line.id)), 1) : quantity;

    await respond(res, cart);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/cart/:itemId
exports.removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter((line) => line.id !== req.params.itemId);
    await respond(res, cart);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/cart
exports.clearCart = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    cart.items = [];
    await respond(res, cart);
  } catch (err) {
    next(err);
  }
};
