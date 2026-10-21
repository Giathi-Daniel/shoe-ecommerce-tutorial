const express = require('express');
const router = express.Router();
const protect = require('../middleware/protect');
const cart = require('../controllers/cartController');

router.use(protect);

router.get('/', cart.getCart);
router.post('/', cart.addToCart);
router.delete('/', cart.clearCart);
router.put('/:itemId', cart.updateQuantity);
router.patch('/:itemId', cart.updateQuantity);
router.delete('/:itemId', cart.removeFromCart);

module.exports = router;
