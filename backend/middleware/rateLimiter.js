const rateLimit = require('express-rate-limit')

exports.apiLimiter = rateLimit({
    windowsMs: 15 * 60 * 1000,
    max: 100, // Each IP to have 100 requests per window    
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false
})

exports.loginLimiter = rateLimit({
    windowsMs: 10* 60 * 1000,
    max: 5,  // max 5 login requests per window
    message: 'Too many login attempts. Please try again later',
    standardHeaders: true,
    legacyHeaders: false
});