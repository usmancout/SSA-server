# ShopSense AI — Backend Server & Hugging Face BERT Engine (`SSA-server`)

This repository contains the **Node.js + Express + MongoDB** backend for **ShopSense AI**, including:
- **50 Seeded Products Across 4 Local Marts** (`Martello Downtown`, `Martello West`, `Prodexa Central`, `Storenta Plaza`) with varied stock availability, prices, and GPS coordinates (`lat`, `lng`).
- **Real Hugging Face BERT Review Authenticity Classifier** (`@xenova/transformers` running `Xenova/distilbert-base-uncased-finetuned-sst-2-english` via ONNX Runtime) in `server/services/bert.service.js`.
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

- `GET /api/products` — Search & filter all 50 products (`?q=`, `?category=`, `?store=`, `?martId=`)
- `GET /api/marts` — List all 4 marts with GPS coordinates & addresses
- `GET /api/stores/:storeName/products` — Store-specific product API (`martello`, `prodexa`, `storenta`)
- `POST /api/reviews/analyze` — Live Hugging Face BERT review classification endpoint
- `POST /api/auth/signup` & `POST /api/auth/signin` — User authentication
- `GET /api/user/dashboard` — User dashboard, wishlist, search history & recommendations

---

## Run Locally

```bash
cd server
npm install
npm start
```
