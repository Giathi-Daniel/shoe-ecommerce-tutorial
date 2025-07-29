const express = require('express')
const router = express.Router()
const protect = require('../middleware/protect')
const { addToCart, removeFromCart, getCart, updateQuantity, incrementItem, decrementItem } = require('../controllers/cartController')

router.use(protect)

router.get('/', getCart)
router.post('/', addToCart)
router.put('/:productId', updateQuantity)
router.patch('/:productId/increment', incrementItem)
router.patch('/:productId/decrement', decrementItem)
router.delete('/:productId', removeFromCart)

module.exports = router;