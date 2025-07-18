const express = require('express')
const router = express.Router()
const protect = require('../middleware/protect')
const { addToCart, removeFromCart, getCart, updateQuantity } = require('../controllers/cartController')

router.use(protect)
router.get('/', getCart)
router.post('/', addToCart)
router.put('/:productId', updateQuantity)
router.delete('/:productId', removeFromCart)

module.exports = router;