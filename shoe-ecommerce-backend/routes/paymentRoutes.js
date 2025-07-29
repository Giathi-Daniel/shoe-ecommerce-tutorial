const express = require('express')
const  { createCheckoutSession, stripeWebhook } = require('../controllers/paymentController')
const protect = require('../middleware/protect')

const router = express.Router()

// webhooks uses raw body
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook)
router.post('/create-checkout-session', protect, createCheckoutSession)

module.exports = router