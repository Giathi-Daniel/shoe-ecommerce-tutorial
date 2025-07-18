const Cart = require('../models/Cart')
const Product = require('../models/Product')

// Add item to cart
exports.addToCart = async(req, res, next) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user.id;

        const product = await Product.findById(productId);
        if(!product) {
            return res.status(404).json({ message: 'Product not found' })
        }

        let cart = await Cart.findOne({ userId });
        if(!cart) {
            cart = await Cart.create({
                userId,
                items: [{ productId, name: product.name, price: product.price, image: product.mainImage, quantity }]
            });
        } else {
            const itemIndex = cart.items.findIndex(i => i.productId.toString() === productId);
            if(itemIndex > -1) {
                cart.items[itemIndex].quantity += quantity;
            } else {
                cart.items.push({ productId, name: product.name, price: product.price, image: product.mainImage })
            }
        }

        await cart.save();
        res.status(200).json({ success: true, cart })
    } catch (err) {
        next(err)
    }
}

// Remove item from cart
exports.removeFromCart = async(req, res, next) => {
    try {
        const { productId } = req.params
        const userId = req.user.id

        const cart = await Cart.findOne({ userId })
        if(!cart) return res.status(404).json({ message: 'Cart not found' })

        cart.items = cart.items.filter(i => i.productId.toString() !== productId);
        await cart.save();

        res.status(200).json({ success: true, cart })
    } catch(err) {
        next(err)
    } 
};

// Get cart
exports.getCart = async(req, res, next) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.id })
        res.status(200).json({ sucess: true, cart: cart || { items: []  } })
    } catch(err) {
        next(err)
    }
}

// update item quantity
exports.updateQuantity = async(req, res, next) => {
    try {
        const { productId } = req.params
        const { quantity } = req.body
        const userId = req.user.id

        const cart = await Cart.findOne({ userId })
        if(!cart) return res.status(404).json({ message: 'Cart not found' })

        const itemIndex = cart.items.findIndex(i => i.productId.toString() === productId);
        if(itemIndex === -1) return res.status(404).json({ message: 'Item not found' })
    
        cart.items[itemIndex].quantity = quantity
        await cart.save();

        res.status(200).json({ success: true, cart })
    } catch(err) {
        next(err)
    }
}