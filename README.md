# ShopSense AI — Backend Server & Hugging Face BERT Engine (`SSA-server`)

This repository contains the **Node.js + Express + MongoDB** backend for **ShopSense AI**, including:
- **50+ Seeded Products per Mart Across 4 Local Marts** (`Martello Downtown`: 56 products, `Martello West`: 52 products, `Prodexa Central`: 60 products, `Storenta Plaza`: 55 products) with varied stock availability, prices, product-matched studio illustrations (`server/services/productImage.helper.js`), and GPS coordinates (`lat`, `lng`).
- **Conversational & Multi-Item Natural Language Search Parser** (`server/services/product.service.js`) supporting queries such as `"I want Nike shoes and a shirt"` or `"laptop under $1500"`.
- **Real Hugging Face BERT Review Authenticity Classifier** (`@xenova/transformers` running `Xenova/distilbert-base-uncased-finetuned-sst-2-english` via ONNX Runtime) in `server/services/bert.service.js`.
- **Conversational AI Assistant Endpoint (`POST /api/chat`)** for product discovery, budget filtering, and review verification.
- **JWT User Authentication, Wishlist, Search History & Personalized Recommendations**.

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
- `POST /api/chat` — Conversational AI Shopping Assistant endpoint
- `POST /api/auth/signup` & `POST /api/auth/login` — Customer authentication
- `GET /api/auth/dashboard` — User dashboard, wishlist, search history & recommendations

---

## Run Locally

```bash
cd server
npm install
npm start
```
