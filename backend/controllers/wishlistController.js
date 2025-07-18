const Wishlist = require('../models/Wishlist')
const Product = require('../models/Product')

// Add to wishlist
exports.addToWishlist = async(req, res, next) => {
    try {
        const { productId } = req.body;
        const userId = req.user.id;

        const product = await Product.findById(productId)
        if(!product) return res.status(404).json({ message: 'Product not found' })

        let wishlist = await WIshlist.findOne({ userId })
        if(!wishlist) {
            wishlist = await Wishlist.create({
                userId,
                items: [{ productId, name: product.name, price: product.price, image:  product.mainImage }]
            });
        } else {
            const exists = wishlist.items.find(i => i.productId.toString() === productId)
            if(!exists) {
                wishlist.items.push({ productId, name: product.name, price: product.price, image: product.mainImage })
            }
        }

        await wishlist.save()
        res.status(200).json({ success: true, wishlist })
    } catch (err) {
        next(err)
    }
};

// Remove from wishlist
exports.removeFromWIshlist = async(req, res, next) => {
    try {
        const { productId } = req.params;
        const wishlist = await Wishlist.findOne({ userId: req.user.id });
        if(!wishlist) return res.status(404).json({ message: 'Wishlist not found' })

        wishlist.items = wishlist.items.filter(i => i.productId.toString() !== productId)
        await wishlist.save()

        res.status(200).json({ success: true, wishlist })
    } catch(err) {
        next(err)
    }
};

// Get wishlist
exports.getWishlist = async(req, res, next) => {
    try {
        const wishlist = await Wishlist.findOne({ userId: req.user.id });
        res.status(200).json({ success: true, wishlist: wishlist || { items: [] } })
    } catch(err) {
        next(err)
    }
}