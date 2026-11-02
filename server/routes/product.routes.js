const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');

router.get('/products', productController.getProducts.bind(productController));
router.get('/marts', productController.getMarts.bind(productController));
// Dedicated dummy mart endpoints (Martello, Prodexa, Storenta)
router.get('/stores/:storeName/products', productController.getStoreProducts.bind(productController));
// Real-time Hugging Face BERT Review Authenticity Classifier endpoint
router.post('/reviews/analyze', productController.analyzeReviews.bind(productController));

module.exports = router;
