const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlist.controller');
const authenticate = require('../middleware/auth.middleware');

router.get('/wishlist', authenticate, wishlistController.getWishlist.bind(wishlistController));
router.post('/wishlist', authenticate, wishlistController.addToWishlist.bind(wishlistController));
router.delete('/wishlist/:productId', authenticate, wishlistController.removeFromWishlist.bind(wishlistController));

module.exports = router;
