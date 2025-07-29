const { body, validationResult } = require('express-validator')

const validateProduct = [
    body('name').notEmpty().withMessage('Product name is required'),
    body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),
    body('mainImage').notEmpty().withMessage('Main image URL required'),
    (req, res, next) => {
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            return res.status(400).json({ errors: errors.array() })
        }
        next();
    }
];

module.exports = validateProduct;