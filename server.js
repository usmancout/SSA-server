const express = require('express');
const app = express();
const port = 5000;
require('dotenv').config();
const mongoDB = require("./utils/db");
const routes = require("./router/auth-router.js");
const cors = require('cors');

// ✅ CORS config — only allow your deployed frontend origin
app.use(cors({
  origin: 'https://endearing-crostata-89c2a0.netlify.app',
  credentials: true
}));

app.use(express.json());
app.use("/api/auth", routes);

mongoDB();
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
