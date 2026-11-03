const mongoose = require('mongoose');

const productVectorSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    brand: { type: String, required: true },
    category: { type: String, required: true, index: true },
    documentText: { type: String, required: true },
    embedding: {
      type: [Number],
      required: true
    },
    dimension: {
      type: Number,
      default: 384
    },
    embeddingModel: {
      type: String,
      default: 'shopsense-hybrid-384d-v1'
    },
    metadata: {
      lowestPrice: Number,
      highestPrice: Number,
      martIds: [String],
      martNames: [String],
      stores: [String],
      bestTrustedMart: String,
      bestTrustedPrice: Number,
      fakeAlertMart: String,
      fakeAlertPct: Number
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ProductVector', productVectorSchema);
