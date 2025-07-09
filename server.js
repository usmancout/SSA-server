const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoDB = require('./utils/db');
const routes = require('./router/auth-router');

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS config — allow everything for now
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // ⚠️ Change * to your domain later
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// ✅ Body parser
app.use(express.json());

// ✅ Routes
app.use('/api/auth', routes);

// ✅ 404 handler
app.use((req, res) => {
  res.status(404).json({ message: '❌ Route not found' });
});

// ✅ Mongo & start server
mongoDB();

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
