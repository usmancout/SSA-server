const express = require('express');
const router = express.Router();
const User = require('../user-schema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only JPEG and PNG images are allowed'));
  }
});

// Helper function to authenticate user with JWT
const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }
  try {
    const decoded = jwt.verify(token, 'hellomoto');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(400).json({ message: 'Invalid token.' });
  }
};

// Avatar upload route
// router.js (only the /avatar route)
router.put('/avatar', authenticate, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    const avatarUrl = `http://localhost:5000/uploads/${req.file.filename}`; // Use absolute URL
    const updatedUser = await User.findByIdAndUpdate(
        req.user.userId,
        { avatar: avatarUrl },
        { new: true }
    );
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({
      message: 'Avatar updated successfully',
      avatar: avatarUrl
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    if (error.message.includes('Only JPEG and PNG')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Existing route for signup
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Username, email, and password are required' });
  }
  try {
    const userExists = await User.findOne({ email: email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });
    return res.status(201).json({
      message: 'User created successfully',
      user: {
        username: newUser.username,
        email: newUser.email,
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = jwt.sign(
        { userId: user._id, username: user.username, email: user.email },
        'hellomoto',
        { expiresIn: '1h' }
    );
    return res.status(200).json({
      message: 'Login successful',
      token: token,
      user: {
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Update profile route
router.put('/profile', authenticate, async (req, res) => {
  const { username, email, phone, location, bio, avatar } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(
        req.user.userId,
        {
          username,
          email,
          phone,
          location,
          bio,
          avatar
        },
        { new: true }
    );
    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        username: updatedUser.username,
        email: updatedUser.email,
        phone: updatedUser.phone,
        location: updatedUser.location,
        bio: updatedUser.bio,
        avatar: updatedUser.avatar
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get profile route
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({
      user: {
        username: user.username,
        email: user.email,
        phone: user.phone,
        location: user.location,
        bio: user.bio,
        avatar: user.avatar
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Google Login Route
router.post('/google-login', async (req, res) => {
  const { access_token } = req.body;
  if (!access_token) {
    return res.status(400).json({ message: 'Access token is required' });
  }
  try {
    const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    const googleUser = await response.json();
    if (!googleUser.email) {
      return res.status(400).json({ message: 'Failed to fetch user info from Google' });
    }
    let user = await User.findOne({ email: googleUser.email });
    if (!user) {
      const hashedPassword = await bcrypt.hash('shopsense_google_default_password', 10);
      user = await User.create({
        username: googleUser.name || 'Google User',
        email: googleUser.email,
        password: hashedPassword,
      });
    }
    const token = jwt.sign(
        { userId: user._id, username: user.username, email: user.email },
        'hellomoto',
        { expiresIn: '1h' }
    );
    return res.status(200).json({
      message: 'Google login successful',
      token: token,
      user: {
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Google login failed' });
  }
});

// Change password route
router.put('/password', authenticate, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  console.log('Password change request:', { currentPassword: !!currentPassword, newPassword: !!newPassword });
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current and new passwords are required' });
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ message: 'New password must be at least 8 characters' });
  }
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    console.log('User found:', { userId: user._id, isGoogleAccount: user.isGoogleAccount });
    if (user.isGoogleAccount) {
      return res.status(403).json({ message: 'Password changes are not allowed for Google accounts' });
    }
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();
    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});






module.exports = router;