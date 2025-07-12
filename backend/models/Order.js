const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        items: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'product',
                },
                quantity: Number,
            },            
        ],
        paymentMethod: {
            type: String,
            enum: ['stripe', 'paypal'],
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'paid', 'failed', 'cancelled'],
            default: 'pending',
        },
    },
    {
        timestamps: true,
    }
);

const Order = new mongoose.model('Order', orderSchema)
module.exports = Order