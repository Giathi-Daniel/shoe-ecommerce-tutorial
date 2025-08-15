const Cart = require('../models/Cart');
const Product = require('../models/Product');

const saveAndPopulateCart = async (cart) => {
    await cart.save();
    await cart.populate('items.productId'); // await is crucial here
    return cart;
};

const getOrCreateCart = async (userId) => {
    let cart = await Cart.findOne({ userId });
    if (!cart) {
        cart = await Cart.create({ userId, items: [] });
    }
    return cart;
};

const findCartItem = (cart, productId) => {
    if (!productId) return undefined;
    return cart.items.find(i => i.productId?.toString() === productId.toString());
};

const isValidQuantity = (quantity) => {
    return Number.isInteger(quantity) && quantity > 0;
};

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