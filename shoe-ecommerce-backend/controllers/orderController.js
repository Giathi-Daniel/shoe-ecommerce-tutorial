const mongoose = require('mongoose');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const logger = require('../utils/logger');
const { calculatePricing } = require('../utils/pricing');

const PAYMENT_METHODS = ['cod', 'stripe', 'paypal'];
const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
const CANCELLABLE_STATUSES = ['pending', 'processing'];

const restoreStock = (items) =>
  Promise.all(
    items.map((item) => Product.updateOne({ _id: item.productId }, { $inc: { stock: item.quantity } }))
  );

const reserveStock = async (items) => {
  const reserved = [];
  for (const item of items) {
    const updated = await Product.findOneAndUpdate(
      { _id: item.productId, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity } }
    );
    if (!updated) {
      await restoreStock(reserved);
      return item;
    }
    reserved.push(item);
  }
  return null;
};

const validateShipping = (shipping = {}) => {
  const required = ['fullName', 'address', 'city', 'postalCode', 'country'];
  const missing = required.filter((field) => !String(shipping[field] || '').trim());
  if (missing.length) return `Shipping ${missing[0]} is required`;
  if (String(shipping.address).trim().length < 5) return 'Invalid address';
  return null;
};

// POST /api/orders
exports.placeOrder = async (req, res, next) => {
  let reservedItems = [];

  try {
    const userId = req.user.id;
    const { shippingAddress, paymentMethod } = req.body;

    const shippingError = validateShipping(shippingAddress);
    if (shippingError) return res.status(400).json({ message: shippingError });
    if (!PAYMENT_METHODS.includes(paymentMethod)) {
      return res.status(400).json({ message: 'A valid payment method is required' });
    }

    const cart = await Cart.findOne({ userId }).populate('items.productId');
    const cartItems = (cart?.items || []).filter((item) => item.productId);
    if (!cartItems.length) return res.status(400).json({ message: 'Cart is empty' });

    const requested = new Map();
    for (const { productId: product, quantity } of cartItems) {
      const total = (requested.get(product.id) || 0) + quantity;
      requested.set(product.id, total);
      if (product.stock < total) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
        });
      }
    }

    const items = cartItems.map(({ productId: product, quantity, size, color }) => ({
      productId: product._id,
      name: product.name,
      image: product.mainImage,
      price: product.price,
      size,
      color,
      quantity,
    }));

    const conflict = await reserveStock(items);
    if (conflict) {
      return res.status(409).json({
        message: `Stock for ${conflict.name} changed while you were checking out. Please review your cart.`,
      });
    }
    reservedItems = items;

    const { fullName, phone, address, city, postalCode, country } = shippingAddress;
    const order = await Order.create({
      user: userId,
      items,
      shippingAddress: { fullName, phone, address, city, postalCode, country },
      paymentMethod,
      ...calculatePricing(items),
    });

    reservedItems = [];
    cart.items = [];
    await cart.save();

    logger.info(`Order ${order._id} created for user ${userId}`);
    res.status(201).json({ success: true, order });
  } catch (err) {
    if (reservedItems.length) await restoreStock(reservedItems);
    logger.error(`Order creation error for user ${req.user.id}: ${err.message}`);
    next(err);
  }
};

// GET /api/orders/my
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/:id
exports.getOrderById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.status(200).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/orders/:id/cancel
exports.cancelOrder = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (!CANCELLABLE_STATUSES.includes(order.orderStatus)) {
      return res.status(400).json({ message: `A ${order.orderStatus} order can no longer be cancelled` });
    }
    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Paid orders must be cancelled through support for a refund' });
    }

    await restoreStock(order.items);
    order.orderStatus = 'cancelled';
    await order.save();

    logger.info(`Order ${order._id} cancelled by user ${req.user.id}`);
    res.status(200).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders (admin)
exports.getAllOrders = async (req, res, next) => {
  try {
    const query = ORDER_STATUSES.includes(req.query.status) ? { orderStatus: req.query.status } : {};
    const orders = await Order.find(query).populate('user', 'name email').sort({ createdAt: -1 }).limit(200);
    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/orders/:id/status (admin)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const status = String(req.body.status || '').toLowerCase();
    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.orderStatus === 'cancelled') {
      return res.status(400).json({ message: 'A cancelled order cannot be updated' });
    }

    if (status === 'cancelled') await restoreStock(order.items);

    if (status === 'delivered') {
      order.deliveredAt = new Date();
      if (order.paymentMethod === 'cod' && order.paymentStatus !== 'paid') {
        order.paymentStatus = 'paid';
        order.paidAt = order.deliveredAt;
      }
    }

    order.orderStatus = status;
    await order.save();

    logger.info(`Order ${order._id} status set to ${status} by admin ${req.user.id}`);
    res.status(200).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};
