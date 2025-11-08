const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/database');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use('/uploads', express.static('uploads'));

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://shop-sense-ai-mu.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
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

app.use('/api/auth', routes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use(errorHandler);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Allowed origins: ${allowedOrigins.join(', ')}`);
  });
}).catch(err => {
  console.error('Database connection failed:', err);
  process.exit(1);
});