const User = require('../models/user.model');

class UserService {
  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      username: user.username,
      email: user.email,
      phone: user.phone,
      location: user.location,
      bio: user.bio,
      avatar: user.avatar
    };
  }

  async updateProfile(userId, profileData) {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      profileData,
      { new: true }
    );

    if (!updatedUser) {
      throw new Error('User not found');
    }

    return {
      username: updatedUser.username,
      email: updatedUser.email,
      phone: updatedUser.phone,
      location: updatedUser.location,
      bio: updatedUser.bio,
      avatar: updatedUser.avatar
    };
  }

  async updateAvatar(userId, avatarUrl) {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatar: avatarUrl },
      { new: true }
    );

    if (!updatedUser) {
      throw new Error('User not found');
    }

    return avatarUrl;
  }

  async addSearchHistory(userId, query, category) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const searchEntry = {
      query,
      category,
      timestamp: new Date()
    };

    if (!user.searchHistory) user.searchHistory = [];
    user.searchHistory.unshift(searchEntry);
    user.searchHistory = user.searchHistory.slice(0, 50);

    if (!user.activity) user.activity = [];
    user.activity.unshift({
      activityType: 'search',
      description: `Searched for "${query}"`,
      timestamp: new Date()
    });
    user.activity = user.activity.slice(0, 100);

    await user.save();
    return { message: 'Search added to history' };
  }

  async addProductView(userId, productData) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.viewedProducts) user.viewedProducts = [];

    user.viewedProducts = user.viewedProducts.filter(
      item => item.productId !== productData.productId
    );

    user.viewedProducts.unshift({
      ...productData,
      viewedAt: new Date()
    });

    user.viewedProducts = user.viewedProducts.slice(0, 100);

    await user.save();
    return { message: 'Product view recorded' };
  }

  async getDashboard(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      stats: {
        totalSearches: user.searchHistory?.length || 0,
        wishlistItems: user.wishlist?.length || 0,
        productsViewed: user.viewedProducts?.length || 0
      },
      recentSearches: user.searchHistory?.slice(-5) || [],
      recentActivity: user.activity?.slice(-10) || [],
      recommendations: user.recommendations || []
    };
  }
}

module.exports = new UserService();
