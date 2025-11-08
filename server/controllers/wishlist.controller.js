const wishlistService = require('../services/wishlist.service');

class WishlistController {
  async getWishlist(req, res) {
    try {
      const wishlist = await wishlistService.getWishlist(req.user.userId);
      res.status(200).json({ wishlist });
    } catch (error) {
      console.error('Wishlist get error:', error);
      if (error.message === 'User not found') {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: 'Server error' });
    }
  }

  async addToWishlist(req, res) {
    const { productId, name, brand, price, originalPrice, image, store, rating, reviewCount, description } = req.body;

    try {
      const wishlist = await wishlistService.addToWishlist(req.user.userId, {
        productId,
        name,
        brand,
        price,
        originalPrice,
        image,
        store,
        rating,
        reviewCount,
        description
      });

      res.status(200).json({
        message: 'Product added to wishlist',
        wishlist
      });
    } catch (error) {
      console.error('Wishlist add error:', error);

      if (error.message === 'User not found') {
        return res.status(404).json({ message: error.message });
      }
      if (error.message === 'Product already in wishlist') {
        return res.status(400).json({ message: error.message });
      }

      res.status(500).json({ message: 'Server error' });
    }
  }

  async removeFromWishlist(req, res) {
    const { productId } = req.params;

    try {
      const wishlist = await wishlistService.removeFromWishlist(req.user.userId, productId);
      res.status(200).json({
        message: 'Product removed from wishlist',
        wishlist
      });
    } catch (error) {
      console.error('Wishlist remove error:', error);

      if (error.message === 'User not found') {
        return res.status(404).json({ message: error.message });
      }
      if (error.message === 'Product not found in wishlist') {
        return res.status(404).json({ message: error.message });
      }

      res.status(500).json({ message: 'Server error' });
    }
  }
}

module.exports = new WishlistController();
