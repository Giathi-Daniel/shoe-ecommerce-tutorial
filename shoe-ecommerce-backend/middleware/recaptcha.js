const logger = require('../utils/logger');

const VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';
const DEFAULT_MIN_SCORE = 0.5;

// Verifies a reCAPTCHA v3 token sent as `recaptchaToken` in the request body.
// Fails closed in production: a missing secret or an unreachable Google blocks the request.
// Outside production, with no secret set, the check is skipped so local development works.
const verifyRecaptcha = (action, { fetchImpl = fetch } = {}) => async (req, res, next) => {
  const secret = process.env.RECAPTCHA_SECRET_KEY;

  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      logger.error('RECAPTCHA_SECRET_KEY is not set; blocking a protected request');
      return res.status(503).json({ message: 'Verification is temporarily unavailable' });
    }
    return next();
  }

  const token = req.body?.recaptchaToken;
  if (typeof token !== 'string' || token.length === 0 || token.length > 4000) {
    return res.status(400).json({ message: 'Verification failed. Please refresh and try again.' });
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetchImpl(VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token, remoteip: req.ip || '' }),
      signal: controller.signal,
    });
    const result = response.ok ? await response.json() : { success: false };
    const minScore = Number(process.env.RECAPTCHA_MIN_SCORE) || DEFAULT_MIN_SCORE;

    const passed = result.success === true && (result.score ?? 0) >= minScore && result.action === action;
    if (!passed) {
      logger.warn(`reCAPTCHA rejected action=${action} score=${result.score ?? 'n/a'} ip=${req.ip}`);
      return res.status(403).json({ message: "We couldn't verify you're human. Please try again." });
    }

    delete req.body.recaptchaToken;
    next();
  } catch (err) {
    logger.warn(`reCAPTCHA check failed: ${err.message}`);
    res.status(403).json({ message: "We couldn't verify you're human. Please try again." });
  } finally {
    clearTimeout(timer);
  }
};

module.exports = verifyRecaptcha;
