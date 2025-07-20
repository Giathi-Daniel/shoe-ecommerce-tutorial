const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// Place order: POST /api/orders
exports.placeOrder = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const userId = req.user.id;
        const { shippingAddress, paymentMethod } = req.body;

        if (!shippingAddress || !paymentMethod) {
            await session.abortTransaction();
            return res.status(400).json({ message: 'Shipping address and payment method are required' });
        }

        const cart = await Cart.findOne({ userId }).session(session);
        if (!cart || cart.items.length === 0) {
            await session.abortTransaction();
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // Fetch products in batch
        const productIds = cart.items.map(item => item.productId);
        const products = await Product.find({ _id: { $in: productIds } }).session(session);
        const productMap = new Map(products.map(p => [p._id.toString(), p]));

        // Validate and atomically update stock
        for (const item of cart.items) {
            const product = productMap.get(item.productId.toString());

            if (!product) {
                await session.abortTransaction();
                return res.status(404).json({ message: `${item.name} not found` });
            }

            if (product.stock < item.quantity) {
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

        // Calculate total
        const totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        // Create order
        const order = await Order.create([{
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
            paymentStatus: 'pending'
        }], { session });

        // Clear cart
        cart.items = [];
        await cart.save({ session });

        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({ success: true, order: order[0] });

    } catch (err) {
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
        res.status(200).json({ success: true, count: orders.length, orders });
    } catch (err) {
        next(err);
    }
};

// PATCH /api/orders/:id/status
exports.updateOrderStatus = async (req, res, next) => {
    try {
        const { status } = req.body
        const allowedStatuses = ['Processing', 'shipped', 'delivered', 'cancelled']

        if(!allowedStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid order status' })
        }

        const order = await Order.findById(req.params.id)
        if(!order) return res.status(404).json({ message: 'Order not found' })

        // If cancelled restore stock
        if(status === 'cancelled' && order.orderStatus !== 'cancelled') {
            for(const item of order.items) {
                await Product.findByIdAndUpdate(item.productId, {
                    $inc: { stock: item.quantity }
                })
            }
        }

        order.orderStatus = status
        await order.save()

        res.status(200).json({ success: true, order })
    } catch(err) {
        next(err)
    }
}