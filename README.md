# ShopSense AI — Backend Server, RAG Vector DB & Hugging Face BERT Engine (`SSA-server`)

This repository contains the **Node.js + Express + MongoDB** backend for **ShopSense AI**, including:
- **80 Seeded Products Across 4 Local Marts (50+ Products per Mart)** (`Martello Downtown`: 56 products, `Martello West`: 52 products, `Prodexa Central`: 60 products, `Storenta Plaza`: 55 products) with varied stock availability, prices, real-life product photography (`server/services/productImage.helper.js`), and GPS coordinates (`lat`, `lng`).
- **384-Dimensional RAG + Vector Database Engine** (`server/services/vectorDb.service.js` and `server/models/productVector.model.js`) that embeds all 80 mart products into 384-D vectors stored in MongoDB (`productvectors`) and `server/data/vector_store.json`, retrieving relevant products via Cosine Similarity for `POST /api/chat`.
- **Conversational & Multi-Item Natural Language Search Parser** (`server/services/product.service.js`) supporting queries such as `"I want Nike shoes and a shirt"` or `"laptop under $1500"`.
- **Real Hugging Face BERT Review Authenticity Classifier** (`@xenova/transformers` running `Xenova/distilbert-base-uncased-finetuned-sst-2-english` via ONNX Runtime) in `server/services/bert.service.js`.
- **Gmail SMTP Password Reset Delivery** (`server/config/email.js` & `server/services/email.service.js`) for sending real password reset links (`POST /api/auth/forgot-password`).
- **JWT User Authentication, Wishlist, Search History & Personalized Recommendations**.

---

## How the RAG + Vector Database Works in `SSA-server`

1. **Embedding Model:** `shopsense-hybrid-384d-v1` (`384` dimensions, L2-normalized).
2. **Ingestion & Storage (`server/services/vectorDb.service.js`):**
   - Fetches all 80 products and their mart-by-mart offers from MongoDB.
   - Builds a structured RAG knowledge document per product containing specs, price range, available marts, best genuine mart pick, and fake review alerts.
   - Computes a 384-D dense embedding vector and upserts all 80 vectors into MongoDB (`ProductVector` collection) and `server/data/vector_store.json`.
3. **Retrieval (`POST /api/chat`):**
   - Decomposes multi-item queries into clauses, embeds each query into the 384-D vector space, computes Cosine Similarity against all stored product vectors, applies budget/mart metadata filters, and returns the top matching mart products.

---

## How BERT Works in `SSA-server`

1. **Model:** `Xenova/distilbert-base-uncased-finetuned-sst-2-english` (6-layer, 66M-parameter DistilBERT Transformer running locally in Node.js—no external API key required).
2. **Inference Pipeline (`server/services/bert.service.js`):**
   - Tokenizes each customer review with BERT's WordPiece tokenizer and passes it through the neural network.
   - Extracts contextual `bertSentiment` (`POSITIVE` / `NEGATIVE`) and softmax probability (`bertSentimentScore`).
   - Evaluates **Rating–Sentiment Discordance**, **Promotional Bot Hyperbole / Spam Phrasing**, and **Verified Buyer Experience** to classify each review as `GENUINE` or `FAKE`.
   - Re-calculates each mart's true `genuineRating` from only the `GENUINE` reviews.

---

## API Routes

- `GET /api/products` — Search & filter catalog (supports conversational `?q=`, `?category=`, `?store=`, `?martId=`)
- `GET /api/marts` — List all 4 marts with GPS coordinates & addresses
- `GET /api/stores/:storeName/products` — Store-specific product API (`martello`, `prodexa`, `storenta`)
- `POST /api/reviews/analyze` — Live Hugging Face BERT review classification endpoint
- `POST /api/chat` — RAG + 384-D Vector DB Conversational AI Shopping Assistant endpoint
- `GET /api/products/vector-status` — Inspect Vector DB status (`80` indexed vectors, `384` dimensions)
- `POST /api/auth/signup` & `POST /api/auth/login` — Customer authentication
- `POST /api/auth/forgot-password` & `POST /api/auth/reset-password/:token` — Gmail SMTP password reset flow
- `GET /api/auth/dashboard` — User dashboard, wishlist, search history & recommendations

---

## Run Locally

```bash
cd server
npm install
npm start
```
