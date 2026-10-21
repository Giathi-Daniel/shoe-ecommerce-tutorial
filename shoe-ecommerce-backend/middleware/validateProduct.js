const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');

const validateProduct = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),
  body('category').isIn(Product.CATEGORIES).withMessage('Invalid category'),
  body('mainImage').trim().notEmpty().withMessage('Main image URL required'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
    }
    next();
  },
];

module.exports = validateProduct;
