const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verifies the bearer token, then checks the user still exists and the token has not been
// revoked (logout and password changes bump tokenVersion). The role comes from the database,
// so demoting an admin takes effect immediately instead of when their token expires.
const protect = async (req, res, next) => {
  const [scheme, token] = (req.headers.authorization || '').split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Not authorized, token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    const user = await User.findById(decoded.id).select('role tokenVersion');

    if (!user || (decoded.tv ?? 0) !== user.tokenVersion) {
      return res.status(401).json({ message: 'Token invalid or expired' });
    }

    req.user = { id: user.id, role: user.role };
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError' || err.name === 'NotBeforeError') {
      return res.status(401).json({ message: 'Token invalid or expired' });
    }
    next(err);
  }
};

module.exports = protect;
