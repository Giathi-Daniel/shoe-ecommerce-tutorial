const Wishlist = require('../models/Wishlist')
const Product = require('../models/Product')
const mongoose = require('mongoose')

const wishlistProductFields = 'name price compareAtPrice mainImage stock rating numReviews sizes colors'

function isValidObjectId(id) {
    return mongoose.Types.ObjectId.isValid(id)
}

async function sendWishlist(res, wishlist, statusCode = 200) {
    if (!wishlist) {
        return res.status(statusCode).json({ success: true, wishlist: { items: [] } })
    }

    await wishlist.populate('items.productId', wishlistProductFields)
    return res.status(statusCode).json({ success: true, wishlist })
}

// Add to wishlist
exports.addToWishlist = async(req, res, next) => {
    try {
        const { productId } = req.body;
        const userId = req.user.id;

        if (!isValidObjectId(productId)) {
            return res.status(400).json({ message: 'Invalid product id' })
        }

        const product = await Product.findById(productId)
        if(!product) return res.status(404).json({ message: 'Product not found' })

        let wishlist = await Wishlist.findOne({ userId })
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
        return sendWishlist(res, wishlist)
    } catch (err) {
        next(err)
    }
};

// Remove from wishlist
exports.removeFromWishlist = async(req, res, next) => {
    try {
        const { productId } = req.params;
        if (!isValidObjectId(productId)) {
            return res.status(400).json({ message: 'Invalid product id' })
        }

        const wishlist = await Wishlist.findOne({ userId: req.user.id });
        if(!wishlist) return res.status(404).json({ message: 'Wishlist not found' })

        wishlist.items = wishlist.items.filter(i => i.productId.toString() !== productId)
        await wishlist.save()

        return sendWishlist(res, wishlist)
    } catch(err) {
        next(err)
    }
};

// Get wishlist
exports.getWishlist = async(req, res, next) => {
    try {
        const wishlist = await Wishlist.findOne({ userId: req.user.id });
        return sendWishlist(res, wishlist)
    } catch(err) {
        next(err)
    }
}
