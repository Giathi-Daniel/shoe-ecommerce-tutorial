const mongoose = require('mongoose')

const cartSchema = new mongoose.Schema(
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
                name: String, //product snapshot to avoid joins
                price: Number,
                image: String,
                quantity: {
                    type: Number,
                    default: 1,
                    min: 1,
                },
            },
        ],
        name: { 
            type: String, 
            required: true 
        },
        price: { 
            type: Number, 
            required: true, 
            min: 0 
        },
        image: { 
            type: String, 
            required: true 
        },

    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Cart', cartSchema)