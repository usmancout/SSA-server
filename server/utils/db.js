const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("📡 MONGO_URI:", process.env.MONGO_URI); // Debug value

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connection successful");
  } catch (error) {
    console.error("❌ Connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
