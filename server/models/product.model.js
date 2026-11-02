const mongoose = require('mongoose');

const reviewItemSchema = new mongoose.Schema({
  user: { type: String, required: true },
  rating: { type: Number, required: true },
  text: { type: String, required: true },
  date: { type: String, default: '2 days ago' },
  // BERT Fake Review Classifier Output
  bertLabel: { type: String, enum: ['GENUINE', 'FAKE'], required: true },
  bertConfidence: { type: Number, required: true }, // e.g. 0.96 (96%)
  bertReason: { type: String } // e.g. 'Repetitive promotional phrasing' or 'Verified specific usage context'
}, { _id: false });

const productOfferSchema = new mongoose.Schema({
  store: { type: String, required: true }, // 'Martello', 'Prodexa', 'Storenta'
  martId: { type: String, required: true },
  martName: { type: String, required: true },
  martAddress: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  rawRating: { type: Number, required: true, default: 4.5 }, // Rating before removing fake reviews
  rating: { type: Number, required: true, default: 4.5 },    // BERT-verified genuine rating
  reviewCount: { type: Number, required: true, default: 120 },
  genuineReviewCount: { type: Number, default: 100 },
  fakeReviewCount: { type: Number, default: 20 },
  fakeReviewPercentage: { type: Number, default: 16 },
  bertTrustScore: { type: Number, default: 84 }, // 0 - 100 authenticity score
  reviews: [reviewItemSchema],
  inStock: { type: Boolean, default: true },
  stockCount: { type: Number, default: 15 },
  deliveryEstimate: { type: String, default: 'Same-day delivery' },
  url: { type: String, required: true }
}, { _id: false });

const productSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  brand: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  rating: { type: Number, default: 4.5 },
  reviewCount: { type: Number, default: 100 },
  features: [{ type: String }],
  tags: [{ type: String }],
  offers: [productOfferSchema],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
