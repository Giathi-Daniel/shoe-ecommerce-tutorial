const express = require('express')
const router = express.Router()
const { placeOrder, getMyOrders, getOrderById, getAllOrders } = require('../controllers/orderController')
const protect = require('../middleware/protect')
const adminOnly = require('../middleware/adminOnly')

router.use(protect)

// user
router.post('/', placeOrder)
router.get('/my', getMyOrders)
router.get('/:id', getOrderById)

// admin
router.get('/', adminOnly, getAllOrders)

module.exports = router;