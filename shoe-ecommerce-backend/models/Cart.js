const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    quantity: {
        type: Number,
        default: 1,
        min: 1,
    },
}, { _id: false });

const cartSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        items: [cartItemSchema],
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// 🔥 VIRTUAL: Calculate cart total dynamically
cartSchema.virtual('total').get(function () {
    if (!Array.isArray(this.items)) return 0;

    return this.items.reduce((sum, item) => {
        const product = item.productId;
        const price = typeof product === 'object' && product?.price ? product.price : 0;
        return sum + (price * item.quantity);
    }, 0);
});

module.exports = mongoose.model('Cart', cartSchema);