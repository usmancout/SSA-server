const mongoose=require("mongoose")

const URI= "mongodb://127.0.0.1:27017/shopsense";


const connectDB=async()=>{
  try {
    await mongoose.connect(URI);
    console.log("Connection successful");


  } catch (error) {
    console.error("Connection failed");
    process.exit(0);

  }



}

module.exports=connectDB;
