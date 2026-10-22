// Rejects MongoDB operator injection such as { "email": { "$gt": "" } }.
// express-mongo-sanitize cannot be used with Express 5, so keys are checked directly.
const hasUnsafeKey = (value, depth = 0) => {
  if (value === null || typeof value !== 'object' || depth > 6) return false;

  return Object.keys(value).some(
    (key) => key.startsWith('$') || key.includes('.') || hasUnsafeKey(value[key], depth + 1)
  );
};

const sanitizeRequest = (req, res, next) => {
  if (hasUnsafeKey(req.body) || hasUnsafeKey(req.query) || hasUnsafeKey(req.params)) {
    return res.status(400).json({ message: 'Invalid request' });
  }
  next();
};

module.exports = sanitizeRequest;
module.exports.hasUnsafeKey = hasUnsafeKey;
