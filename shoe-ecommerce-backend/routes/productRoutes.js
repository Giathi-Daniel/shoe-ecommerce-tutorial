const express = require('express');
const router = express.Router();
const product = require('../controllers/productController');
const protect = require('../middleware/protect');
const adminOnly = require('../middleware/adminOnly');
const validateProduct = require('../middleware/validateProduct');
const { validateReview } = require('../middleware/validateInput');

router.get('/', product.getProducts);
router.get('/meta', product.getProductMeta);
router.get('/:id', product.getSingleProduct);
router.get('/:id/related', product.getRelatedProducts);

router.post('/:id/reviews', protect, validateReview, product.createReview);
router.delete('/:id/reviews/:reviewId', protect, product.deleteReview);

router.post('/', protect, adminOnly, validateProduct, product.createProduct);
router.put('/:id', protect, adminOnly, product.updateProduct);
router.delete('/:id', protect, adminOnly, product.deleteProduct);

module.exports = router;
