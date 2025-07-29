const express = require('express')
const router = express.Router()
const protect = require('../middleware/protect')
const { addToWishlist, removeFromWishlist, getWishlist } = require('../controllers/wishlistController')

router.use(protect)
router.get('/', getWishlist)
router.post('/', addToWishlist)
router.delete('/:productId', removeFromWishlist)

module.exports = router;