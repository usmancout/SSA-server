const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoDB = require('./utils/db');
const routes = require('./router/auth-router');

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://endearing-crostata-89c2a0.netlify.app/'
  ],
  methods: 'GET,POST,PUT,DELETE,OPTIONS',
  allowedHeaders: 'Content-Type, Authorization',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('/api/auth', routes);
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

mongoDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
