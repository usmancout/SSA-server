const express = require('express');
const app = express();
require('dotenv').config();
const mongoDB = require("./utils/db");
const routes = require("./router/auth-router.js");
const cors = require('cors');

const port = process.env.PORT || 5000;

// ✅ CORS config
const corsOptions = {
  origin: ['https://endearing-crostata-89c2a0.netlify.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));

// ✅ Handle preflight requests globally
app.options('*', cors(corsOptions));

// ✅ Body parser middleware
app.use(express.json());

// ✅ Routes
app.use("/api/auth", routes);

// ✅ DB and Server start
mongoDB();
app.listen(port, () => {
  console.log(`✅ Server started on port ${port}`);
});
