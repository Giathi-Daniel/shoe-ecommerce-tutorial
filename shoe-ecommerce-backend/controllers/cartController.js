const Cart = require('../models/Cart');
const { calculateTotal } = require('../utils/cartUtils');
const {
    getOrCreateCart,
    saveAndPopulateCart,
    findCartItem,
    isValidQuantity,
    ensureProductExists,
} = require('../helpers/cartHelper');


// Add item to cart
exports.addToCart = async (req, res, next) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user.id;

        const product = await ensureProductExists(productId);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        if (!isValidQuantity(quantity)) {
            return res.status(400).json({ message: 'Invalid quantity value' });
        }

        const cart = await getOrCreateCart(userId);
        const item = findCartItem(cart, productId);

        if (item) {
            item.quantity += quantity;
        } else {
            cart.items.push({ productId, quantity });
        }

        await saveAndPopulateCart(cart);
        const total = calculateTotal(cart);
        res.status(200).json({ success: true, cart, total });
    } catch (err) {
        next(err);
    }
};

// Remove item from cart
exports.removeFromCart = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const userId = req.user.id;

        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        cart.items = cart.items.filter(i => i.productId.toString() !== productId);
        await saveAndPopulateCart(cart);
        const total = calculateTotal(cart);
        res.status(200).json({ success: true, cart, total });
    } catch (err) {
        next(err);
    }
};

// Get cart
exports.getCart = async (req, res, next) => {
    try {
        const cart = await getOrCreateCart(req.user.id);
        await saveAndPopulateCart(cart);
        const total = calculateTotal(cart);
        res.status(200).json({ success: true, cart, total });
    } catch (err) {
        next(err);
    }
};

// update item quantity
exports.updateQuantity = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;
        const userId = req.user.id;

        if (!isValidQuantity(quantity)) {
            return res.status(400).json({ message: 'Invalid quantity value' });
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        const item = findCartItem(cart, productId);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        item.quantity = quantity;

        await saveAndPopulateCart(cart);
        const total = calculateTotal(cart);
        res.status(200).json({ success: true, cart, total });
    } catch (err) {
        next(err);
    }
};

// PATCH /api/cart/:productId/increment
exports.incrementItem = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const userId = req.user.id;

        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        const item = findCartItem(cart, productId);
        if (!item) return res.status(404).json({ message: 'Item not found in cart' });

        item.quantity += 1;

        await saveAndPopulateCart(cart);
        const total = calculateTotal(cart);
        res.status(200).json({ success: true, cart, total });
    } catch (err) {
        next(err);
    }
};

// PATCH /api/cart/:productId/decrement
exports.decrementItem = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const userId = req.user.id;

        const cart = await Cart.findOne({ userId });
        if (!cart) return res.status(404).json({ message: 'Cart not found' });

        const item = findCartItem(cart, productId);
        if (!item) return res.status(404).json({ message: 'Item not found in cart' });

        if (item.quantity > 1) {
            item.quantity -= 1;
        } else {
            cart.items = cart.items.filter(i => i.productId.toString() !== productId);
        }

        await saveAndPopulateCart(cart);
        const total = calculateTotal(cart);
        res.status(200).json({ success: true, cart, total });
    } catch (err) {
        next(err);
    }
};