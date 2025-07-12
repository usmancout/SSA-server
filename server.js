const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoDB = require('./utils/db');
const routes = require('./router/auth-router');

const app = express();
const PORT = process.env.PORT || 5000;

app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://endearing-crostata-89c2a0.netlify.app'
  ],
  credentials: true,
}));

app.use(express.json());
app.use('/api/auth', routes);
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

mongoDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
