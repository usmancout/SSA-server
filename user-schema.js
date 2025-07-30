const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  location: { type: String },
  bio: { type: String },
  avatar: { type: String },
  isGoogleAccount: { type: Boolean, default: false }  // 💥 add this line
});

const User = mongoose.model('User', userSchema);

module.exports = User;
