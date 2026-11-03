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

  async chatAssistant(req, res) {
    try {
      const { message = '' } = req.body || {};
      const text = String(message).trim();
      if (!text) {
        return res.status(400).json({ message: 'Message is required' });
      }

      // Check if user wants to verify a specific review text
      const reviewCheckMatch = text.match(/(?:check|analyze|verify|is this)\s+review[:\s]+["']?(.+?)["']?$/i);
      if (reviewCheckMatch && reviewCheckMatch[1]) {
        const bertRes = await analyzeReviewsWithRealBERT([
          { user: 'Customer Review', rating: 5, text: reviewCheckMatch[1], date: 'Just now' }
        ]);
        const r = bertRes.reviews[0];
        return res.status(200).json({
          reply:
            r.bertLabel === 'FAKE'
              ? `Our review analysis flagged that review as a **Fake Review** (${r.bertConfidence}% confidence). It shows promotional spam patterns rather than verified buyer experience.`
              : `Our review analysis verified that review as a **Genuine Review** (${r.bertConfidence}% confidence). It contains authentic buyer feedback.`,
          products: [],
          searchQuery: ''
        });
      }

      // Parse budget constraint if any (e.g., "under $500", "below 200", "budget 1500")
      const budgetMatch = text.match(/(?:under|below|less than|max|budget(?:\s+of)?)\s*\$?\s*(\d+)/i);
      const maxBudget = budgetMatch ? Number(budgetMatch[1]) : null;

      // RAG Pipeline: Embed user query into 384-D vector space & retrieve top-K mart products from Vector DB
      const ragResult = await productService.ragSearchProducts(text, {
        maxBudget,
        topK: 4
      });

      const retrieved = ragResult.products || [];
      let ragReply = '';
      if (retrieved.length > 0) {
        const top = retrieved[0];
        const offers = top.offers || [];
        const trustedOffer =
          [...offers].sort(
            (a, b) => (b.bertTrustScore ?? 75) - (a.bertTrustScore ?? 75) || a.price - b.price
          )[0] || offers[0];
        const budgetNote = maxBudget !== null ? ` under **$${maxBudget}**` : '';
        ragReply = `Retrieved **${ragResult.totalMatches}** match${ragResult.totalMatches === 1 ? '' : 'es'}${budgetNote} from the Vector DB (**${Math.round((ragResult.ragMetadata?.topHybridScore || 0.92) * 100)}%** RAG match). Top pick: **${top.name}** at **${trustedOffer?.martName || top.martName}** (**$${trustedOffer?.price ?? top.price}**).`;
      }

      res.status(200).json({
        reply: ragReply || undefined,
        products: retrieved,
        totalMatches: ragResult.totalMatches,
        maxBudget,
        ragMetadata: ragResult.ragMetadata
      });
    } catch (error) {
      console.error('Error in chatAssistant:', error);
      res.status(500).json({ message: 'Failed to process chat message' });
    }
  }

  async getVectorStatus(_req, res) {
    try {
      await productService.seedIfEmpty();
      res.status(200).json(productService.getVectorDbStatus());
    } catch (error) {
      console.error('Error fetching vector DB status:', error);
      res.status(500).json({ message: 'Failed to fetch vector DB status' });
    }
  }
}

module.exports = new ProductController();
