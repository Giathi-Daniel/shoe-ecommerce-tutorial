const express = require('express');
const payment = require('../controllers/paymentController');
const protect = require('../middleware/protect');

const router = express.Router();

router.post('/stripe/webhook', express.raw({ type: 'application/json' }), payment.stripeWebhook);

router.use(express.json(), protect);
router.post('/stripe/session', payment.createStripeSession);
router.post('/stripe/confirm', payment.confirmStripePayment);
router.post('/paypal/create', payment.createPayPalOrder);
router.post('/paypal/capture', payment.capturePayPalOrder);

module.exports = router;
