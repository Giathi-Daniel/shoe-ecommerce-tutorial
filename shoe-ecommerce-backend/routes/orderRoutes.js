const express = require('express')
const router = express.Router()
const { placeOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus } = require('../controllers/orderController')
const protect = require('../middleware/protect')
const adminOnly = require('../middleware/adminOnly')

router.use(protect)

// user
router.post('/', placeOrder)
router.get('/my', getMyOrders)
router.get('/:id', getOrderById)
router.get('/', adminOnly, getAllOrders)

// admin order status update
router.patch('/:id/status', adminOnly, updateOrderStatus)

module.exports = router;