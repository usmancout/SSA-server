const express=require('express');
const app=express();
const port= 5000;
require('dotenv').config();
const mongoDB=require("./utils/db");
const routes=require("./router/auth-router.js");
const cors = require('cors');
app.use(cors());  // Enable CORS for all origins


app.use(express.json());


app.use("/api/auth",routes);

mongoDB();
app.listen(port,()=>{
  console.log(`Server started on port ${port}`);
})

