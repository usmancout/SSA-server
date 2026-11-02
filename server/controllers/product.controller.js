const productService = require('../services/product.service');
const { analyzeReviewsWithRealBERT, BERT_MODEL_ID } = require('../services/bert.service');

class ProductController {
  async getProducts(req, res) {
    try {
      const { q = '', category = 'All Categories', store = 'All Stores', martId = 'Select Mart' } = req.query;
      const products = await productService.searchProducts({
        query: q,
        category,
        store,
        martId
      });
      res.status(200).json({
        products,
        marts: productService.getMarts(),
        total: products.length
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      res.status(500).json({ message: 'Failed to fetch products' });
    }
  }

  async getStoreProducts(req, res) {
    try {
      const { storeName } = req.params;
      const { q = '' } = req.query;
      const products = await productService.getProductsByStoreName(storeName, q);
      res.status(200).json({
        store: storeName,
        products,
        total: products.length
      });
    } catch (error) {
      console.error('Error fetching store products:', error);
      res.status(500).json({ message: 'Failed to fetch store products' });
    }
  }

  async getMarts(_req, res) {
    try {
      res.status(200).json({ marts: productService.getMarts() });
    } catch (error) {
      console.error('Error fetching marts:', error);
      res.status(500).json({ message: 'Failed to fetch marts' });
    }
  }

  async analyzeReviews(req, res) {
    try {
      const { reviews = [], text = '', rating = 5, user = 'Customer' } = req.body || {};
      const inputReviews = Array.isArray(reviews) && reviews.length > 0
        ? reviews
        : text
          ? [{ user, rating: Number(rating) || 5, text, date: 'Just now' }]
          : [];

      if (inputReviews.length === 0) {
        return res.status(400).json({ message: 'Provide either a `text` string or a `reviews` array to analyze with BERT.' });
      }

      const result = await analyzeReviewsWithRealBERT(inputReviews);
      res.status(200).json({
        model: BERT_MODEL_ID,
        ...result
      });
    } catch (error) {
      console.error('Error running BERT review analysis:', error);
      res.status(500).json({ message: 'Failed to run BERT review analysis' });
    }
  }
}

module.exports = new ProductController();
