const express = require('express')
const { createOrder, captureOrder } = require('../controllers/paypalController')
const protect = require('../middleware/protect')

const router = express.Router()

router.post('/create-order', protect, createOrder)
router.post('/capture-order', protect, captureOrder)

module.exports = router