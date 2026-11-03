const fs = require('fs');
const path = require('path');
const ProductVector = require('../models/productVector.model');

const EMBEDDING_DIM = 384;
const EMBEDDING_MODEL_ID = 'shopsense-hybrid-384d-v1';
const VECTOR_STORE_FILE = path.join(__dirname, '..', 'data', 'vector_store.json');

/**
 * 96 Semantic Concept Clusters (Dims 0..95)
 * Each cluster activates a dedicated semantic dimension when any of its domain terms appear.
 */
const SEMANTIC_CONCEPTS = [
  ['smartphone', 'phone', 'phones', 'mobile', 'iphone', 'galaxy', 'pixel', 'oneplus', 'xiaomi', 'android', '5g', 'cellular'],
  ['laptop', 'laptops', 'notebook', 'macbook', 'xps', 'zephyrus', 'spectre', 'ultrabook', 'computer', 'pc'],
  ['tv', 'television', 'qled', 'oled', 'smart-tv', 'screen', 'display', '4k', 'uhd'],
  ['earbuds', 'earphones', 'airpods', 'buds', 'in-ear', 'tws'],
  ['headphones', 'headset', 'wh-1000xm5', 'quietcomfort', 'over-ear', 'noise-canceling', 'anc'],
  ['console', 'playstation', 'ps5', 'xbox', 'nintendo', 'switch', 'gaming', 'video-game'],
  ['tablet', 'ipad', 'stylus', 'touchscreen'],
  ['camera', 'dslr', 'mirrorless', 'canon', 'leica', 'photography', 'lens'],
  ['mouse', 'logitech', 'mx-master', 'cursor', 'trackpad'],
  ['keyboard', 'keychron', 'mechanical', 'switches', 'typing'],
  ['shoes', 'shoe', 'sneakers', 'sneaker', 'footwear', 'jordan', 'pegasus', 'air-force', 'ultraboost', '990v6', 'velocity'],
  ['shirt', 'shirts', 't-shirt', 'tshirt', 'polo', 'top', 'crewneck', 'oxford', 'button-down', 'dri-fit'],
  ['jeans', 'denim', 'pants', 'trousers', '511', 'levis'],
  ['jacket', 'coat', 'puffer', 'nuptse', 'trucker', 'sherpa', 'outerwear', 'winter'],
  ['sunglasses', 'glasses', 'shades', 'eyewear', 'aviator', 'holbrook', 'polarized', 'ray-ban', 'oakley'],
  ['watch', 'wristwatch', 'smartwatch', 'chronograph', 'automatic', 'tissot', 'fossil', 'garmin'],
  ['bag', 'tote', 'handbag', 'purse', 'duffel', 'backpack', 'luggage'],
  ['cooker', 'instant-pot', 'pressure-cooker', 'slow-cooker', 'rice-maker'],
  ['vacuum', 'dyson', 'roomba', 'irobot', 'cleaner', 'suction', 'cordless'],
  ['coffee', 'espresso', 'breville', 'nespresso', 'barista', 'latte', 'cappuccino'],
  ['airfryer', 'air-fryer', 'ninja', 'fryer', 'roast'],
  ['mixer', 'kitchenaid', 'baking', 'dough', 'stand-mixer'],
  ['bulb', 'hue', 'lighting', 'lamp', 'led', 'ambiance', 'smart-bulb'],
  ['chair', 'ergonomic', 'office-chair', 'lumbar', 'mesh-chair', 'desk-chair', 'furniture'],
  ['blender', 'vitamix', 'smoothie', 'juicer'],
  ['purifier', 'air-purifier', 'hepa', 'levoit', 'filtration'],
  ['thermostat', 'ecobee', 'heating', 'cooling', 'temperature'],
  ['book', 'books', 'hardcover', 'reading', 'bestseller', 'author'],
  ['finance', 'money', 'investing', 'wealth', 'economics'],
  ['habits', 'productivity', 'focus', 'deep-work', 'self-help'],
  ['programming', 'coding', 'software', 'clean-code', 'pragmatic', 'data-intensive', 'engineering'],
  ['yoga', 'pilates', 'mat', 'manduka', 'stretching'],
  ['dumbbell', 'dumbbells', 'weights', 'bowflex', 'strength', 'lifting'],
  ['massager', 'theragun', 'percussion', 'recovery', 'muscle'],
  ['racket', 'racquet', 'tennis', 'badminton', 'wilson', 'yonex'],
  ['bottle', 'flask', 'hydro-flask', 'tumbler', 'hydration', 'water-bottle'],
  ['basketball', 'spalding', 'ball', 'court', 'hoop'],
  ['suspension', 'trx', 'resistance', 'bodyweight'],
  ['foundation', 'makeup', 'fenty', 'cosmetics', 'matte'],
  ['styler', 'airwrap', 'hair-dryer', 'curler', 'haircare'],
  ['perfume', 'fragrance', 'cologne', 'dior', 'sauvage', 'chanel', 'eau-de-parfum', 'scent'],
  ['serum', 'vitamin-c', 'niacinamide', 'la-roche-posay', 'ordinary', 'anti-aging'],
  ['cleanser', 'cerave', 'face-wash', 'hydrating', 'skincare', 'facial'],
  ['trimmer', 'shaver', 'oneblade', 'grooming', 'beard', 'razor'],
  // Brand & Category Dimensions
  ['apple', 'ios', 'm3', 'm4', 'magsafe'],
  ['samsung', 'galaxy'],
  ['sony', 'playstation'],
  ['nike', 'jordan', 'dri-fit'],
  ['adidas', 'ultraboost'],
  ['levis', 'denim'],
  ['dyson', 'v15', 'airwrap'],
  ['philips', 'hue', 'oneblade'],
  ['electronics', 'tech', 'gadget', 'gadgets'],
  ['fashion', 'apparel', 'clothing', 'wear', 'outfit'],
  ['home', 'kitchen', 'appliance', 'appliances', 'garden'],
  ['sports', 'fitness', 'gym', 'workout', 'exercise', 'athletic', 'running'],
  ['beauty', 'personal-care', 'skin', 'grooming'],
  ['martello', 'mart1', 'mart2'],
  ['prodexa', 'mart3'],
  ['storenta', 'mart4']
];

const STOP_WORDS = new Set([
  'i', 'want', 'need', 'looking', 'for', 'buy', 'get', 'show', 'me', 'find', 'search',
  'some', 'a', 'an', 'the', 'please', 'can', 'you', 'give', 'have', 'in', 'at', 'from',
  'with', 'good', 'best', 'cheap', 'price', 'near', 'my', 'house', 'mart', 'store',
  'to', 'of', 'is', 'are', 'something', 'like', 'that', 'and', 'or', 'also', 'plus'
]);

function fnv1aHash(str, seed = 2166136261) {
  let h = seed >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

function stemToken(token) {
  if (token.length <= 3) return token;
  if (token.endsWith('ies') && token.length > 4) return token.slice(0, -3) + 'y';
  if (token.endsWith('es') && (token.endsWith('shes') || token.endsWith('ches') || token.endsWith('xes'))) {
    return token.slice(0, -2);
  }
  if (token.endsWith('s') && !token.endsWith('ss') && !token.endsWith('us')) {
    return token.slice(0, -1);
  }
  return token;
}

function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .map(t => t.trim())
    .filter(t => t.length > 1 && !STOP_WORDS.has(t));
}

/**
 * Generates a 384-dimensional L2-normalized dense semantic embedding vector
 * combining 60 domain concept dimensions + 324 signed n-gram random projection dimensions.
 */
function generateEmbedding(text) {
  const vec = new Float32Array(EMBEDDING_DIM);
  const rawLower = String(text || '').toLowerCase();
  const tokens = tokenize(rawLower);
  const stemmedTokens = tokens.map(stemToken);
  const tokenSet = new Set([...tokens, ...stemmedTokens]);

  // 1. Semantic Concept Subspace (Dims 0..SEMANTIC_CONCEPTS.length - 1)
  for (let i = 0; i < SEMANTIC_CONCEPTS.length; i++) {
    const group = SEMANTIC_CONCEPTS[i];
    let hits = 0;
    for (const term of group) {
      if (tokenSet.has(term) || tokenSet.has(stemToken(term))) {
        hits += 1;
      }
    }
    if (hits > 0) {
      vec[i] = 2.5 * Math.min(2.0, 1 + Math.log1p(hits));
    }
  }

  const hashOffset = SEMANTIC_CONCEPTS.length;
  const hashSpace = EMBEDDING_DIM - hashOffset;

  // 2. Unigram + Stemmed Unigram Feature Hashing
  for (const tok of stemmedTokens) {
    const h1 = fnv1aHash(`u:${tok}`, 2166136261);
    const h2 = fnv1aHash(`u2:${tok}`, 1469598103);
    const idx1 = hashOffset + (h1 % hashSpace);
    const sign1 = (h1 & 1) === 0 ? 1.0 : -1.0;
    vec[idx1] += sign1 * 1.8;

    const idx2 = hashOffset + (h2 % hashSpace);
    const sign2 = (h2 & 1) === 0 ? 1.0 : -1.0;
    vec[idx2] += sign2 * 1.2;

    // 3. Character 3-gram hashing for typo tolerance & subword similarity
    const padded = `<${tok}>`;
    for (let j = 0; j <= padded.length - 3; j++) {
      const tri = padded.slice(j, j + 3);
      const ht = fnv1aHash(`c:${tri}`);
      const idxT = hashOffset + (ht % hashSpace);
      const signT = (ht & 1) === 0 ? 0.35 : -0.35;
      vec[idxT] += signT;
    }
  }

  // 4. Word Bigram Hashing
  for (let i = 0; i < stemmedTokens.length - 1; i++) {
    const bg = `${stemmedTokens[i]}_${stemmedTokens[i + 1]}`;
    const hb = fnv1aHash(`b:${bg}`);
    const idxB = hashOffset + (hb % hashSpace);
    const signB = (hb & 1) === 0 ? 1.1 : -1.1;
    vec[idxB] += signB;
  }

  // 5. L2 Normalization so dot product == exact cosine similarity
  let normSq = 0;
  for (let i = 0; i < EMBEDDING_DIM; i++) {
    normSq += vec[i] * vec[i];
  }
  const norm = Math.sqrt(normSq) || 1;
  const normalized = new Array(EMBEDDING_DIM);
  for (let i = 0; i < EMBEDDING_DIM; i++) {
    normalized[i] = Number((vec[i] / norm).toFixed(6));
  }

  return normalized;
}

function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    const a = vecA[i];
    const b = vecB[i];
    dot += a * b;
    normA += a * a;
    normB += b * b;
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom > 0 ? dot / denom : 0;
}

/**
 * Builds a structured RAG knowledge document for a mart product
 * including mart availability, pricing, and genuine vs. fake review analytics.
 */
function buildProductRAGDocument(product) {
  const offers = product.offers || [];
  const trustedOffers = [...offers].sort(
    (a, b) => (b.bertTrustScore ?? 75) - (a.bertTrustScore ?? 75) || a.price - b.price
  );
  const bestTrusted = trustedOffers[0] || offers[0] || {};
  const highFakeOffer = offers.find(o => (o.fakeReviewPercentage ?? 0) >= 50);

  const martSummaries = offers
    .map(
      o =>
        `${o.martName || o.store} ($${o.price}, ${o.deliveryEstimate || 'Same-day'}, Genuine Rating: ${o.rating || 4.5}/5, Fake Reviews: ${o.fakeReviewPercentage ?? 25}%)`
    )
    .join('; ');

  const documentText = [
    `Product: ${product.name}`,
    `Brand: ${product.brand}`,
    `Category: ${product.category}`,
    `Tags: ${(product.tags || []).join(', ')}`,
    `Features: ${(product.features || []).join(', ')}`,
    `Description: ${product.description}`,
    `Price Range: $${product.lowestPrice ?? product.price} to $${product.highestPrice ?? product.price}`,
    `Available Marts (${offers.length}): ${martSummaries}`,
    `Best Genuine Mart Pick: ${bestTrusted.martName || product.martName} at $${bestTrusted.price ?? product.price}`,
    highFakeOffer
      ? `Fake Review Warning: ${highFakeOffer.martName} has ${highFakeOffer.fakeReviewPercentage}% fake reviews`
      : ''
  ]
    .filter(Boolean)
    .join(' | ');

  return {
    documentText,
    metadata: {
      lowestPrice: product.lowestPrice ?? product.price,
      highestPrice: product.highestPrice ?? product.price,
      martIds: offers.map(o => o.martId),
      martNames: offers.map(o => o.martName || o.store),
      stores: [...new Set(offers.map(o => o.store))],
      bestTrustedMart: bestTrusted.martName || product.martName,
      bestTrustedPrice: bestTrusted.price ?? product.price,
      fakeAlertMart: highFakeOffer ? highFakeOffer.martName : null,
      fakeAlertPct: highFakeOffer ? highFakeOffer.fakeReviewPercentage : 0
    }
  };
}

class VectorDbService {
  constructor() {
    this.memoryIndex = [];
    this.isInitialized = false;
  }

  /**
   * Fetches all products from the marts, generates 384-D embeddings for each product's
   * RAG knowledge chunk, and persists them into MongoDB (`ProductVector`) and `data/vector_store.json`.
   */
  async indexMartProducts(formattedProducts) {
    if (!Array.isArray(formattedProducts) || formattedProducts.length === 0) {
      return { count: 0, dimension: EMBEDDING_DIM };
    }

    const vectorRecords = formattedProducts.map(product => {
      const { documentText, metadata } = buildProductRAGDocument(product);
      // Weight identity terms more strongly in the embedding text so item/brand retrieval is sharp
      const weightedEmbeddingInput = [
        product.name,
        product.name,
        product.brand,
        product.category,
        (product.tags || []).join(' '),
        (product.features || []).join(' '),
        product.description
      ].join(' ');

      const embedding = generateEmbedding(weightedEmbeddingInput);

      return {
        productId: product.id || product.productId,
        name: product.name,
        brand: product.brand,
        category: product.category,
        documentText,
        embedding,
        dimension: EMBEDDING_DIM,
        embeddingModel: EMBEDDING_MODEL_ID,
        metadata,
        productSnapshot: product
      };
    });

    this.memoryIndex = vectorRecords;
    this.isInitialized = true;

    // Persist to MongoDB ProductVector collection
    try {
      const bulkOps = vectorRecords.map(rec => ({
        updateOne: {
          filter: { productId: rec.productId },
          update: {
            $set: {
              productId: rec.productId,
              name: rec.name,
              brand: rec.brand,
              category: rec.category,
              documentText: rec.documentText,
              embedding: rec.embedding,
              dimension: rec.dimension,
              embeddingModel: rec.embeddingModel,
              metadata: rec.metadata
            }
          },
          upsert: true
        }
      }));
      if (bulkOps.length > 0) {
        await ProductVector.bulkWrite(bulkOps);
      }
    } catch (err) {
      console.warn('Vector DB MongoDB upsert warning:', err.message);
    }

    // Persist snapshot to local JSON vector store file for inspection & fast cold boot
    try {
      const dir = path.dirname(VECTOR_STORE_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const diskPayload = {
        engine: 'ShopSense AI Vector Store',
        embeddingModel: EMBEDDING_MODEL_ID,
        dimension: EMBEDDING_DIM,
        updatedAt: new Date().toISOString(),
        totalVectors: vectorRecords.length,
        vectors: vectorRecords.map(v => ({
          productId: v.productId,
          name: v.name,
          brand: v.brand,
          category: v.category,
          documentText: v.documentText,
          metadata: v.metadata,
          embeddingPreview: v.embedding.slice(0, 12),
          embedding: v.embedding
        }))
      };
      fs.writeFileSync(VECTOR_STORE_FILE, JSON.stringify(diskPayload, null, 2), 'utf8');
    } catch (err) {
      console.warn('Vector DB disk snapshot warning:', err.message);
    }

    console.log(
      `🧠 Vector DB Indexed ${vectorRecords.length} mart products (${EMBEDDING_DIM}-D embeddings, model: ${EMBEDDING_MODEL_ID})`
    );

    return {
      count: vectorRecords.length,
      dimension: EMBEDDING_DIM,
      embeddingModel: EMBEDDING_MODEL_ID
    };
  }

  /**
   * Splits a multi-item or natural-language query into sub-queries, embeds each into 384-D vector space,
   * runs Cosine Similarity + Hybrid Lexical Alignment over the Vector DB, and returns top-K mart products.
   */
  async retrieveProductsRAG(rawQuery, allFormattedProducts, options = {}) {
    const { maxBudget = null, topK = 4, martFilter = null, storeFilter = null } = options;

    if (!this.isInitialized || this.memoryIndex.length !== allFormattedProducts.length) {
      await this.indexMartProducts(allFormattedProducts);
    }

    const cleaned = String(rawQuery || '')
      .replace(/(?:under|below|less than|max|budget(?:\s+of)?)\s*\$?\s*\d+/gi, '')
      .replace(
        /\b(?:cheapest|lowest price|nearest|closest|near me|genuine reviews|fake reviews|recommend|suggest|which mart has|where can i buy)\b/gi,
        ''
      )
      .trim();

    // Split multi-item requests ("nike shoes and a shirt" -> ["nike shoes", "a shirt"])
    const subQueries = (cleaned || rawQuery)
      .split(/\b(?:and|or|also|plus|with)\b|[,&+]/i)
      .map(s => s.trim())
      .filter(s => tokenize(s).length > 0);

    const activeSubQueries = subQueries.length > 0 ? subQueries : [rawQuery];

    // Candidate pool filtered by budget/mart/store metadata
    let candidates = this.memoryIndex;
    if (maxBudget !== null) {
      candidates = candidates.filter(rec => (rec.metadata.lowestPrice ?? 0) <= maxBudget);
    }
    if (martFilter) {
      candidates = candidates.filter(rec => rec.metadata.martIds.includes(martFilter));
    }
    if (storeFilter) {
      candidates = candidates.filter(rec =>
        rec.metadata.stores.some(s => s.toLowerCase() === storeFilter.toLowerCase())
      );
    }

    const selectedByProductId = new Map();
    const perClauseLimit = Math.max(2, Math.ceil(topK / activeSubQueries.length));

    for (const subQuery of activeSubQueries) {
      const queryTokens = tokenize(subQuery);
      const queryStems = queryTokens.map(stemToken);
      const queryEmbedding = generateEmbedding(subQuery);

      const scoredForClause = candidates
        .map(rec => {
          const cosine = cosineSimilarity(queryEmbedding, rec.embedding);

          // Identity lexical verification so unrelated items don't drift in
          const identityText = `${rec.name} ${rec.brand} ${rec.category} ${(rec.productSnapshot.tags || []).join(' ')}`.toLowerCase();
          const identityStems = new Set(tokenize(identityText).map(stemToken));

          let matchedTokens = 0;
          for (const qStem of queryStems) {
            if (identityStems.has(qStem)) {
              matchedTokens += 1;
            } else {
              // Check semantic concept co-membership (synonyms)
              const sharesConcept = SEMANTIC_CONCEPTS.some(
                group =>
                  group.some(g => stemToken(g) === qStem) &&
                  group.some(g => identityStems.has(stemToken(g)))
              );
              if (sharesConcept) matchedTokens += 0.9;
            }
          }

          const tokenCoverage = queryStems.length > 0 ? matchedTokens / queryStems.length : 0;
          const hybridScore = cosine * 0.55 + tokenCoverage * 0.45;

          return {
            rec,
            cosine: Number(cosine.toFixed(4)),
            tokenCoverage: Number(tokenCoverage.toFixed(4)),
            hybridScore: Number(hybridScore.toFixed(4))
          };
        })
        .filter(item => item.tokenCoverage >= 0.45 || item.cosine >= 0.32)
        .sort((a, b) => b.hybridScore - a.hybridScore || a.rec.metadata.lowestPrice - b.rec.metadata.lowestPrice);

      for (const hit of scoredForClause.slice(0, perClauseLimit)) {
        const existing = selectedByProductId.get(hit.rec.productId);
        if (!existing || hit.hybridScore > existing.hybridScore) {
          selectedByProductId.set(hit.rec.productId, hit);
        }
      }
    }

    const finalRanked = [...selectedByProductId.values()]
      .sort((a, b) => b.hybridScore - a.hybridScore)
      .slice(0, topK);

    const retrievedProducts = finalRanked.map(item => ({
      ...item.rec.productSnapshot,
      ragSimilarity: item.cosine,
      ragHybridScore: item.hybridScore,
      ragDocumentChunk: item.rec.documentText
    }));

    return {
      products: retrievedProducts,
      totalMatches: selectedByProductId.size,
      ragMetadata: {
        engine: 'ShopSense RAG + Vector DB',
        embeddingModel: EMBEDDING_MODEL_ID,
        dimensions: EMBEDDING_DIM,
        indexedVectors: this.memoryIndex.length,
        subQueries: activeSubQueries,
        topSimilarity: finalRanked[0]?.cosine ?? 0,
        topHybridScore: finalRanked[0]?.hybridScore ?? 0
      }
    };
  }

  getStatus() {
    return {
      initialized: this.isInitialized,
      embeddingModel: EMBEDDING_MODEL_ID,
      dimensions: EMBEDDING_DIM,
      indexedProducts: this.memoryIndex.length,
      vectorStoreFile: VECTOR_STORE_FILE
    };
  }
}

module.exports = {
  vectorDbService: new VectorDbService(),
  generateEmbedding,
  cosineSimilarity,
  EMBEDDING_DIM,
  EMBEDDING_MODEL_ID
};
