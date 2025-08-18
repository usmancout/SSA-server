const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoDB = require('./utils/db');
const routes = require('./router/auth-router');

const app = express();
const PORT = process.env.PORT || 5000; // Added fallback port

// Middlewares
app.use(express.json()); // Parse JSON bodies first
app.use('/uploads', express.static('uploads')); // Static files

// Enhanced CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://shop-sense-ai-mu.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Routes
app.use('/api/auth', routes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error Handler (add this after all middleware/routes)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Database connection and server start
mongoDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
  });
}).catch(err => {
  console.error('Database connection failed:', err);
  process.exit(1);
});