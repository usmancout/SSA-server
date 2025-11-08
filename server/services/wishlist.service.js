const User = require('../models/user.model');

class WishlistService {
  async getWishlist(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return user.wishlist || [];
  }

  async addToWishlist(userId, productData) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.wishlist) user.wishlist = [];

    const existingIndex = user.wishlist.findIndex(
      item => item.productId === productData.productId
    );
    if (existingIndex !== -1) {
      throw new Error('Product already in wishlist');
    }

    const wishlistItem = {
      ...productData,
      dateAdded: new Date()
    };

    user.wishlist.unshift(wishlistItem);

    if (!user.activity) user.activity = [];
    user.activity.unshift({
      activityType: 'wishlist_add',
      description: `Added ${productData.name} to wishlist`,
      timestamp: new Date()
    });
    user.activity = user.activity.slice(0, 100);

    await user.save();
    return user.wishlist;
  }

  async removeFromWishlist(userId, productId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.wishlist) user.wishlist = [];

    const itemIndex = user.wishlist.findIndex(item => item.productId === productId);
    if (itemIndex === -1) {
      throw new Error('Product not found in wishlist');
    }

    const removedItem = user.wishlist[itemIndex];
    user.wishlist.splice(itemIndex, 1);

    if (!user.activity) user.activity = [];
    user.activity.unshift({
      activityType: 'wishlist_remove',
      description: `Removed ${removedItem.name} from wishlist`,
      timestamp: new Date()
    });
    user.activity = user.activity.slice(0, 100);

    await user.save();
    return user.wishlist;
  }
}

module.exports = new WishlistService();
