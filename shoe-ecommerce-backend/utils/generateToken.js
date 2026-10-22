const jwt = require('jsonwebtoken');

const generateToken = (user) =>
  jwt.sign({ id: user._id, role: user.role, tv: user.tokenVersion ?? 0 }, process.env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });

module.exports = generateToken;
