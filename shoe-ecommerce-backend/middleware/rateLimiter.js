const rateLimit = require('express-rate-limit');

const limiter = (options) =>
  rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    ...options,
  });

const emailKey = (req) => String(req.body?.email || '').toLowerCase().slice(0, 254) || req.ip;

exports.apiLimiter = limiter({
  windowMs: 15 * 60 * 1000,
  max: 600,
  message: { message: 'Too many requests from this IP, please try again later' },
});

// Per IP, for login and registration
exports.loginLimiter = limiter({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: { message: 'Too many attempts. Please try again later' },
});

// Per target account, so a botnet spreading attempts across IPs still hits a ceiling
exports.accountLimiter = limiter({
  windowMs: 60 * 60 * 1000,
  max: 20,
  keyGenerator: emailKey,
  message: { message: 'Too many attempts for this account. Please try again later' },
});

// Password reset sends email, so it is the tightest limit
exports.resetLimiter = limiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { message: 'Too many reset requests. Please try again later' },
});

exports.resetAccountLimiter = limiter({
  windowMs: 60 * 60 * 1000,
  max: 3,
  keyGenerator: emailKey,
  message: { message: 'Too many reset requests for this account. Please try again later' },
});

// Writing reviews and placing orders
exports.writeLimiter = limiter({
  windowMs: 10 * 60 * 1000,
  max: 30,
  message: { message: 'Too many requests. Please slow down' },
});
