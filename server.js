// ✅ Core dependencies
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// ✅ Local modules
const mongoDB = require('./utils/db');
const routes = require('./router/auth-router');

// ✅ App setup
const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Allowed origins for CORS (from environment)
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.CLIENT_URL_PROD
];

// ✅ CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`❌ CORS blocked: origin ${origin} is not allowed`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// ✅ Middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // For preflight requests

app.use(express.json()); // Parse JSON bodies

// ✅ API Routes
app.use('/api/auth', routes);

// ✅ 404 Fallback
app.use((req, res) => {
  res.status(404).json({ message: '❌ Route not found' });
});

// ✅ Connect to MongoDB & start the server
mongoDB();

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
