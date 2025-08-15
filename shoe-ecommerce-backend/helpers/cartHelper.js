const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Save and populate cart
const saveAndPopulateCart = async (cart) => {
    await cart.save();
    await cart.populate('items.productId'); // <--- added await here
    return cart;
};

// Get or create cart for a user
const getOrCreateCart = async (userId) => {
    let cart = await Cart.findOne({ userId });
    if (!cart) {
        cart = await Cart.create({ userId, items: [] });
    }
    return cart;
};

// Find item in cart
const findCartItem = (cart, productId) => {
    return cart.items.find(i => i.productId.toString() === productId.toString()); // <--- normalize both sides
};

// Validate quantity input
const isValidQuantity = (quantity) => {
    return Number.isInteger(quantity) && quantity > 0;
};

// Check if product exists
const ensureProductExists = async (productId) => {
    return await Product.findById(productId);
};

module.exports = {
    saveAndPopulateCart,
    getOrCreateCart,
    findCartItem,
    isValidQuantity,
    ensureProductExists,
};