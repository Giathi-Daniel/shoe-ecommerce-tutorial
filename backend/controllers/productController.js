const Product = require('../models/Product')

// POST /api/products
exports.createProduct = async(req, res, next) => {
    try {
        const newProduct = await Product.create(req.body)
        res.status(201).json({ success: true, product: newProduct });
    } catch(err) {
        next(err)
    }
};

// GET /api/products?search=&category=&min=&max=
exports.getProducts = async(req, res, next) => {
    try {
        const {search, category, min, max, page = 1, limit = 12 } = req.query
        const query = {}

        if(search) {
            query.name = { $regex: search, $options: 'i'}
        }

        if(category) {
            query.category = category
        }

        if(min || max) {
            query.price = {}
            if(min) query.price.$gte = Number(min)
            if(max) query.price.$lte = Number(max)
        }
        
        const products = await Product.find(query)
        .skip((page - 1) * limit)
        .limit(Number(limit))

        res.status(200).json({ success: true, count: products.length, products })
    } catch(err) {
        next(err)
    }
}