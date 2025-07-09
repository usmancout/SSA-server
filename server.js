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

// ✅ Allowed origins (read from .env OR hardcoded for now)
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.CLIENT_URL_PROD,
  'https://endearing-crostata-89c2a0.netlify.app' // in case env isn't picked up
];

// ✅ CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    console.log('🌐 Incoming Origin:', origin);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`❌ CORS blocked: ${origin} not allowed`));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// ✅ Apply CORS middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Preflight request support

// ✅ Body parser middleware
app.use(express.json());

// ✅ API routes
app.use('/api/auth', routes);

// ✅ 404 Fallback handler
app.use((req, res) => {
  res.status(404).json({ message: '❌ Route not found' });
});

// ✅ Connect to MongoDB & start server
mongoDB(); // Your db connection logic (in utils/db.js)

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
