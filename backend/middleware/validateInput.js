const { body, validationResult } = require('express-validator')

const validateAuth = [
    body('email')
        .trim()
        .escape()
        .normalizeEmail()
        .isEmail().withMessage('Must be a valid email')
        .matches(/@gmail\.com$/).withMessage('Only Gmail addresses allowed'),

    body('password')
        .trim()
        .isStrongPassword().withMessage('Password must be 8+ charaters, with symbols, numbers, uppercase, lowercase'),
    
    body('name')
        .optional()
        .trim()
        .escape(),

    (req, res, next) => {
        const errors = validationResult(req)
        if(!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }
        next()
    }
];

module.exports = validateAuth;