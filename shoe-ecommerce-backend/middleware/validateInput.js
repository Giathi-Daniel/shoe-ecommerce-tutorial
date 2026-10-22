const { body, validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() });
  }
  next();
};

const email = body('email').trim().isEmail().withMessage('Must be a valid email').normalizeEmail();

exports.validateRegister = [
  body('name').trim().isLength({ min: 2, max: 60 }).withMessage('Name must be 2-60 characters'),
  email,
  body('password')
    .isLength({ max: 128 })
    .withMessage('Password is too long')
    .bail()
    .isStrongPassword()
    .withMessage('Password must be 8+ characters with uppercase, lowercase, number and symbol'),
  handleValidation,
];

exports.validateLogin = [
  email,
  body('password').isString().isLength({ min: 1, max: 128 }).withMessage('Password is required'),
  handleValidation,
];

exports.validateEmail = [email, handleValidation];

exports.validatePasswordChange = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ max: 128 })
    .withMessage('Password is too long')
    .bail()
    .isStrongPassword()
    .withMessage('Password must be 8+ characters with uppercase, lowercase, number and symbol'),
  handleValidation,
];

exports.validateReset = [
  body('password')
    .isLength({ max: 128 })
    .withMessage('Password is too long')
    .bail()
    .isStrongPassword()
    .withMessage('Password must be 8+ characters with uppercase, lowercase, number and symbol'),
  handleValidation,
];

exports.validateReview = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').trim().isLength({ min: 3, max: 2000 }).withMessage('Review must be 3-2000 characters'),
  body('title').optional().trim().isLength({ max: 120 }).withMessage('Title is too long'),
  handleValidation,
];

exports.validateAddress = [
  body('fullName').trim().isLength({ min: 2 }).withMessage('Full name is required'),
  body('address').trim().isLength({ min: 5 }).withMessage('Address must be at least 5 characters'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('postalCode').trim().notEmpty().withMessage('Postal code is required'),
  body('country').trim().notEmpty().withMessage('Country is required'),
  handleValidation,
];
