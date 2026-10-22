const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');

const rules = (optional) => {
  const field = (name) => (optional ? body(name).optional() : body(name));

  return [
    field('name').trim().notEmpty().withMessage('Product name is required').isLength({ max: 150 }).withMessage('Name is too long'),
    field('description').trim().notEmpty().withMessage('Description is required'),
    field('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),
    field('category').isIn(Product.CATEGORIES).withMessage('Invalid category'),
    field('mainImage')
      .trim()
      .matches(/^(https:\/\/|\/(?!\/))[^\s<>"']+$/)
      .withMessage('Image must be an https:// URL or a /path on this site'),
    body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
      }
      next();
    },
  ];
};

module.exports = rules(false);
module.exports.update = rules(true);
