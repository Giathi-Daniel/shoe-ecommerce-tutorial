const mongoose = require('mongoose')

const wishlistSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        items: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                },
                name: String,
                price: Number,
                image: String,
            },
        ],
    },
    { timestamps: true }
);

wishlistSchema.index({ userId: 1 }, { unique: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);
