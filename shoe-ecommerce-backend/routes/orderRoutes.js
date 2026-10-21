const express = require('express');
const router = express.Router();
const order = require('../controllers/orderController');
const protect = require('../middleware/protect');
const adminOnly = require('../middleware/adminOnly');

router.use(protect);

router.post('/', order.placeOrder);
router.get('/my', order.getMyOrders);
router.get('/', adminOnly, order.getAllOrders);
router.get('/:id', order.getOrderById);
router.patch('/:id/cancel', order.cancelOrder);
router.patch('/:id/status', adminOnly, order.updateOrderStatus);

module.exports = router;
