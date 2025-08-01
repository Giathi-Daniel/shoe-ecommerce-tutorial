module.exports = function csrfVerify(req, res, next) {
  const method = req.method;
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    const csrfCookie = req.cookies.csrfToken;
    const csrfHeader = req.get('X-CSRF-Token');
    if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
      return res.status(403).json({ message: 'Invalid CSRF token' });
    }
  }
  next();
};

const csrf = require('csurf');

// // Use double submit cookie method
// const csrfProtection = csrf({
//   cookie: {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === 'production',
//     sameSite: 'strict',
//   },
// });

// module.exports = csrfProtection;
