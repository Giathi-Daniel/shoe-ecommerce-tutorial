const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

const MAX_PAGE_SIZE = 60;

const SORT_OPTIONS = {
  'price-asc': { price: 1 },
  'price-desc': { price: -1 },
  rating: { rating: -1, numReviews: -1 },
  newest: { createdAt: -1 },
  popular: { numReviews: -1, rating: -1 },
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const toList = (value) =>
  String(value || '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);

const assertValidId = (id, res) => {
  if (mongoose.Types.ObjectId.isValid(id)) return true;
  res.status(404).json({ message: 'Product not found' });
  return false;
};

const buildQuery = (params) => {
  const { search, category, brand, min, max, rating, inStock, featured, deals } = params;
  const query = {};

  if (search) {
    const pattern = new RegExp(escapeRegex(String(search).trim()), 'i');
    query.$or = [{ name: pattern }, { brand: pattern }, { tags: pattern }, { category: pattern }];
  }

  const categories = toList(category).filter((c) => Product.CATEGORIES.includes(c));
  if (categories.length) query.category = { $in: categories };

  const brands = toList(brand);
  if (brands.length) query.brand = { $in: brands };

  const price = {};
  if (min !== undefined && min !== '' && !isNaN(Number(min))) price.$gte = Number(min);
  if (max !== undefined && max !== '' && !isNaN(Number(max))) price.$lte = Number(max);
  if (Object.keys(price).length) query.price = price;

  if (rating && !isNaN(Number(rating))) query.rating = { $gte: Number(rating) };
  if (inStock === 'true') query.stock = { $gt: 0 };
  if (featured === 'true') query.isFeatured = true;
  if (deals === 'true') query.$expr = { $gt: ['$compareAtPrice', '$price'] };

  return query;
};

// POST /api/products
exports.createProduct = async (req, res, next) => {
  try {
    const { description } = req.body;

    if (!req.body.shortDescription && description) {
      req.body.shortDescription = description.split('. ').slice(0, 2).join('. ').replace(/\.?$/, '.');
    }

    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

// GET /api/products?search=&category=&brand=&min=&max=&rating=&inStock=&deals=&sort=&page=&limit=
exports.getProducts = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 12, 1), MAX_PAGE_SIZE);
    const query = buildQuery(req.query);

    const [products, total] = await Promise.all([
      Product.find(query)
        .select('-reviews')
        .sort(SORT_OPTIONS[req.query.sort] || { createdAt: -1, _id: 1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Product.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      products,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/meta
exports.getProductMeta = async (req, res, next) => {
  try {
    const [categories, brands, [priceRange]] = await Promise.all([
      Product.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Product.aggregate([{ $group: { _id: '$brand', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Product.aggregate([{ $group: { _id: null, min: { $min: '$price' }, max: { $max: '$price' } } }]),
    ]);

    res.status(200).json({
      success: true,
      categories: categories.map((c) => ({ value: c._id, count: c.count })),
      brands: brands.map((b) => ({ value: b._id, count: b.count })),
      priceRange: priceRange ? { min: priceRange.min, max: priceRange.max } : { min: 0, max: 0 },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:id
exports.getSingleProduct = async (req, res, next) => {
  try {
    if (!assertValidId(req.params.id, res)) return;

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.status(200).json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:id/related
exports.getRelatedProducts = async (req, res, next) => {
  try {
    if (!assertValidId(req.params.id, res)) return;

    const product = await Product.findById(req.params.id).select('category brand');
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const products = await Product.find({
      _id: { $ne: product._id },
      $or: [{ category: product.category }, { brand: product.brand }],
    })
      .select('-reviews')
      .sort({ rating: -1, numReviews: -1 })
      .limit(12);

    res.status(200).json({ success: true, products });
  } catch (err) {
    next(err);
  }
};

// PUT /api/products/:id
exports.updateProduct = async (req, res, next) => {
  try {
    if (!assertValidId(req.params.id, res)) return;

    const { reviews, rating, numReviews, ...changes } = req.body;
    const product = await Product.findByIdAndUpdate(req.params.id, changes, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.status(200).json({ success: true, product });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/products/:id
exports.deleteProduct = async (req, res, next) => {
  try {
    if (!assertValidId(req.params.id, res)) return;

    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.status(200).json({ success: true, message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
};

// POST /api/products/:id/reviews
exports.createReview = async (req, res, next) => {
  try {
    if (!assertValidId(req.params.id, res)) return;

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const userId = req.user.id;
    if (product.reviews.some((r) => r.user.toString() === userId)) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    const user = await User.findById(userId).select('name');
    const verifiedPurchase = await Order.exists({
      user: userId,
      'items.productId': product._id,
      orderStatus: { $ne: 'cancelled' },
    });

    product.reviews.push({
      user: userId,
      name: user.name,
      rating: Number(req.body.rating),
      title: req.body.title || '',
      comment: req.body.comment,
    });
    product.recalculateRatings();
    await product.save();

    res.status(201).json({ success: true, verifiedPurchase: !!verifiedPurchase, product });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/products/:id/reviews/:reviewId
exports.deleteReview = async (req, res, next) => {
  try {
    if (!assertValidId(req.params.id, res)) return;

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const review = product.reviews.id(req.params.reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    review.deleteOne();
    product.recalculateRatings();
    await product.save();

    res.status(200).json({ success: true, product });
  } catch (err) {
    next(err);
  }
};
