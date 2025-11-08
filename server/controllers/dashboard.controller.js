const userService = require('../services/user.service');

class DashboardController {
  async getDashboard(req, res) {
    try {
      const dashboardData = await userService.getDashboard(req.user.userId);
      res.status(200).json({ dashboardData });
    } catch (error) {
      console.error('Dashboard data error:', error);
      if (error.message === 'User not found') {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: 'Server error' });
    }
  }

  async addSearchHistory(req, res) {
    const { query, category } = req.body;

    try {
      await userService.addSearchHistory(req.user.userId, query, category);
      res.status(200).json({ message: 'Search added to history' });
    } catch (error) {
      console.error('Search history error:', error);
      if (error.message === 'User not found') {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: 'Server error' });
    }
  }

  async addProductView(req, res) {
    const { productId, name, brand, price, image, store } = req.body;

    try {
      await userService.addProductView(req.user.userId, {
        productId,
        name,
        brand,
        price,
        image,
        store
      });
      res.status(200).json({ message: 'Product view recorded' });
    } catch (error) {
      console.error('Product view error:', error);
      if (error.message === 'User not found') {
        return res.status(404).json({ message: error.message });
      }
      res.status(500).json({ message: 'Server error' });
    }
  }
}

module.exports = new DashboardController();
