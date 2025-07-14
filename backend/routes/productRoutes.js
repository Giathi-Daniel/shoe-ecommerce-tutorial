const express = require('express')
const router = express.Router()
const { createProduct, getProducts } = require('../controllers/productController')
const protect = require('../middleware/protect')
const adminOnly = require('../middleware/adminOnly')

router.get('/', getProducts)
router.post('/', protect, adminOnly, createProduct)

module.exports = router