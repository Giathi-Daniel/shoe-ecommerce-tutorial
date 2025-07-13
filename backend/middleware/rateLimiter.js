const rateLimit = require('express-rate-limit')

const loginLimiter = rateLimit({
    windowsMs: 60 * 1000,
    max: 5,  // max 5 login requests per window
    message: 'Too many login attempts. Please try again later',
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = loginLimiter