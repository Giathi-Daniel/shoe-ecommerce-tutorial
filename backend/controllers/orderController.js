const Order = require('../models/Order')
const Cart = require('../models/Cart')
const Product = require('../models/Product')
const validator = require('validator')

// Place order: POST /api/orders
exports.placeOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { shippingAddress, paymentMethod } = req.body;

    if (!shippingAddress || !shippingAddress.address || !shippingAddress.postalCode) {
      return res.status(400).json({ message: 'Shipping address is required and must be complete' });
    }
    if (!validator.isLength(shippingAddress.address, { min: 5 })) {
      return res.status(400).json({ message: 'Invalid address' });
    }
    if (!validator.isPostalCode(shippingAddress.postalCode, 'any')) {
      return res.status(400).json({ message: 'Invalid postal code' });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Validate products and stock
    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.name}` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}. Available: ${product.stock}` });
      }
    }

    // Reduce stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    const totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = await Order.create({
      user: userId,
      items: cart.items.map(item => ({
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
    });

    cart.items = [];
    await cart.save();

    res.status(201).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/my
exports.getMyOrders = async(req, res, next) => {
    try {
        const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: orders.length, orders })
    } catch(err) {
        next(err)
    }
}

// GET /api/orders/:id (single order)
exports.getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');
        if(!order) return res.status(404).json({ message: 'Order not found' })

        // only user with the specified Id and admin can access
        if(order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to view this order' })
        }

        res.status(200).json({ success: true, order })
    } catch(err) {
        next(err)
    }
};

// GET /api/orders (admin)
exports.getAllOrders = async (req, res, next) => {
    try {
        const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 })
        res.status(200).json({ success: true, count: orders.length, orders })
    } catch(err) {
        next(err)
    }
}