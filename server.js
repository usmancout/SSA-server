const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoDB = require('./utils/db');
const routes = require('./router/auth-router');

const app = express();
const port = process.env.PORT || 5000;

// ✅ CORS config
const corsOptions = {
  origin: 'https://endearing-crostata-89c2a0.netlify.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// ✅ Apply CORS middleware first
app.use(cors(corsOptions));

// ✅ Handle preflight requests for all routes
app.options('*', cors(corsOptions));

// ✅ Body parser middleware
app.use(express.json());

// ✅ API routes
app.use('/api/auth', routes);

// ✅ Fallback CORS headers on all responses (including errors)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://endearing-crostata-89c2a0.netlify.app');
  res.header('Access-Control-Allow-Credentials', 'true');

  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// ✅ 404 handler (optional but good practice)
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ✅ Connect to DB and start server
mongoDB();
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
