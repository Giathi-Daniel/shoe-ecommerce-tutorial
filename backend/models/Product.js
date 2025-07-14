const mongoose = require('mongoose')

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true,
        },
        description: {
            type: String, 
            requierd: true,
            maxlength: 1000,
        },
        price: {
            type: Number,
            required: true,
            min: [0, 'Price cannot be negative'],
        },
        category: {
            type: String,
            required: true,
            enum: ['men', 'women', 'kids', 'sports', 'casual', 'formal']
        },
        mainImage: {
            type: String,
            required: true,
        },
        subImages: {
            type: [String],
            validate: [arr => arr.length <= 4, 'Max 4 sub images'],
        },
        stock: {
            type: Number,
            required: true,
            default: 0,
        },
        brand: {
            type: String,
            default: 'Generic',
        },
        tags: {
            type: [String],
            default: [],
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Product', productSchema)