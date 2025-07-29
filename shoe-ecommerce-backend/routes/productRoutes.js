const express = require('express')
const router = express.Router()
const { createProduct, getProducts, getSingleProduct, updateProduct, deleteProduct } = require('../controllers/productController')
const protect = require('../middleware/protect')
const adminOnly = require('../middleware/adminOnly')
const validateProduct = require('../middleware/validateProduct')

// public
router.get('/', getProducts)
router.get('/:id', getSingleProduct)

// admin
router.post('/', protect, adminOnly, validateProduct, createProduct)
router.put('/:id', protect, adminOnly, validateProduct, updateProduct)
router.delete('/:id', protect, adminOnly, deleteProduct)

module.exports = router