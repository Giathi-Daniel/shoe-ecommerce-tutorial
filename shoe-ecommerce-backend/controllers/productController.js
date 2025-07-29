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

// GET /api/products/:id
exports.getSingleProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id)
        if(!product) {
            return res.status(404).json({ message: 'Product not found' })
        } 
        res.status(200).json({ success: true, product })
    } catch (err) {
        next(err)
    }
};

// PUT /api/products/:id
exports.updateProduct = async(req, res, next) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if(!product) {
            return res.status(400).json({ message: 'Product not found' })
        }
        res.status(200).json({ success: true, product });
    } catch(err) {
        next(err);
    }
};

// DELETE /api/products/:id
exports.deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id)
        if(!product) {
            return res.status(404).json({ message: 'product not found' })
        }
        res.status(200).json({ success: true, message: 'Product deleted' })
    } catch (err) {
        next(err)
    }
};