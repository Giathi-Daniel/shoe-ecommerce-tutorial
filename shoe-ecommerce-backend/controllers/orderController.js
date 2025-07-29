const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const mongoose = require('mongoose');
const validator = require('validator');
const logger = require('../utils/logger');

// POST /api/orders
exports.placeOrder = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const userId = req.user.id;
    const { shippingAddress, paymentMethod } = req.body;

    // Input validation (from security-improvements)
    if (
      !shippingAddress ||
      !shippingAddress.address ||
      !shippingAddress.postalCode
    ) {
      logger.warn(`Order creation failed: incomplete shipping address for user ${userId}`);
      await session.abortTransaction();
      return res
        .status(400)
        .json({ message: 'Shipping address is required and must be complete' });
    }

    if (!validator.isLength(shippingAddress.address, { min: 5 })) {
      logger.warn(`Order creation failed: invalid address for user ${userId}`);
      await session.abortTransaction();
      return res.status(400).json({ message: 'Invalid address' });
    }

    if (!validator.isPostalCode(shippingAddress.postalCode, 'any')) {
      logger.warn(`Order creation failed: invalid address for user ${userId}`);
      await session.abortTransaction();
      return res.status(400).json({ message: 'Invalid postal code' });
    }

    if (!paymentMethod) {
      logger.warn(`Order creation failed: missing payment method for user ${userId}`);
      await session.abortTransaction();
      return res.status(400).json({ message: 'Payment method is required' });
    }

    const cart = await Cart.findOne({ userId }).session(session);
    if (!cart || cart.items.length === 0) {
      logger.warn(`Order creation failed: empty cart for user ${userId}`);
      await session.abortTransaction();
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Fetch products in batch
    const productIds = cart.items.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } }).session(session);
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    // Validate and update stock atomically
    for (const item of cart.items) {
      const product = productMap.get(item.productId.toString());

      if (!product) {
        logger.warn(`Order creation failed: product ${item.productId} not found for user ${userId}`);
        await session.abortTransaction();
        return res.status(404).json({ message: `${item.name} not found` });
      }

      if (product.stock < item.quantity) {
        logger.warn(`Order creation failed: insufficient stock for product ${product.name} for user ${userId}`);
        await session.abortTransaction();
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
        });
      }

      const updated = await Product.findOneAndUpdate(
        { _id: item.productId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { session }
      );

      if (!updated) {
        await session.abortTransaction();
        return res.status(400).json({
          message: `Stock for ${product.name} may have changed. Please try again.`,
        });
      }
    }

    const totalAmount = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const order = await Order.create(
      [
        {
          user: userId,
          items: cart.items.map((item) => ({
            productId: item.productId,
            name: item.name,
            image: item.image,
            price: item.price,
            quantity: item.quantity,
          })),
          shippingAddress,
          paymentMethod,
          totalAmount,
          paymentStatus: 'pending',
        },
      ],
      { session }
    );

    // Clear cart
    cart.items = [];
    await cart.save({ session });

    logger.info(`Order created successfully for user ${userId}`);

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({ success: true, order: order[0] });
  } catch (err) {
    logger.error(`Order creation error for user ${req.user.id}: ${err.message}`);
    await session.abortTransaction();
    session.endSession();
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

// GET /api/orders/:id (single order)
exports.getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');
        if (!order) return res.status(404).json({ message: 'Order not found' });

        // only the owner or an admin can access
        if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to view this order' });
        }

        res.status(200).json({ success: true, order });
    } catch (err) {
        next(err);
    }
};

// GET /api/orders (admin)
exports.getAllOrders = async (req, res, next) => {
    try {
      const orders = await Order.find()
        .populate('user', 'name email')
        .sort({ createdAt: -1 });
      logger.info(`Admin ${req.user.id} retrieved all orders (${orders.length} orders)`);
      res.status(200).json({ success: true, count: orders.length, orders });
    } catch (err) {
      logger.error(`Admin ${req.user.id} error fetching all orders: ${err.message}`);
      next(err);
    }
};

// PATCH /api/orders/:id/status
exports.updateOrderStatus = async (req, res, next) => {
    try {
      const { status } = req.body
      const allowedStatuses = ['Processing', 'shipped', 'delivered', 'cancelled']

      if(!allowedStatuses.includes(status)) {
        logger.warn(`Invalid order status update attempted: ${status} by user ${req.user.id}`);
        return res.status(400).json({ message: 'Invalid order status' })
      }

      const order = await Order.findById(req.params.id)
      if(!order) {
        logger.warn(`Order status update failed: order not found (ID: ${req.params.id}) by user ${req.user.id}`);
        return res.status(404).json({ message: 'Order not found' })
      } 

      // If cancelled restore stock
      if(status === 'cancelled' && order.orderStatus !== 'cancelled') {
          for(const item of order.items) {
              await Product.findByIdAndUpdate(item.productId, {
                  $inc: { stock: item.quantity }
              })
          }
        logger.info(`Stock restored for cancelled order ${order._id} by user ${req.user.id}`);
      }

      order.orderStatus = status
      await order.save()

      logger.info(`Order ${order._id} status updated to ${status} by user ${req.user.id}`);
      res.status(200).json({ success: true, order })
    } catch(err) {
      logger.error(`Order status update error for order ${req.params.id}: ${err.message}`);
      next(err)
    }
}