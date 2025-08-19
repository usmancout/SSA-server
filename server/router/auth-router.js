const express = require('express');
const router = express.Router();
const User = require('../user-schema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const nodemailer = require('nodemailer'); // for sending emails
const fs = require('fs'); // Add this at the top with other requires

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
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
  },
});

router.get("/", (req, res) => {
  res.send("Hello World from Home");
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

    const baseUrl = process.env.NODE_ENV === 'production'
        ? `https://ssa-serverr.onrender.com/uploads/`
        : `http://localhost:5000/uploads/`;
    const avatarUrl = `${baseUrl}${req.file.filename}`;

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
      avatar: avatarUrl,
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    if (error.message.includes('Only JPEG and PNG')) {
      return res.status(400).json({ message: error.message });
    }
    // Handle file system or other specific errors
    if (error.code === 'ENOENT') {
      return res.status(500).json({ message: 'Upload directory error' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
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


router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Generate reset token (expires in 15 minutes)
    const resetToken = jwt.sign(
        { userId: user._id },
        'hellomoto',
        { expiresIn: '15m' }
    );

    // Create reset link
    const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // Send email (setup real SMTP later)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <p>You requested a password reset.</p>
        <p>Click the link below to reset your password (expires in 15 minutes):</p>
        <a href="${resetLink}">${resetLink}</a>
      `
    };

    await transporter.sendMail(mailOptions);

    return res.json({ message: 'Password reset link sent to email' });

  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// ===========================
// Reset Password Route
// ===========================
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ message: 'New password must be at least 8 characters' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, 'hellomoto');

    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.json({ message: 'Password reset successful' });

  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(400).json({ message: 'Invalid or expired token' });
  }
});



//routes for dashboard and wishlist

// Add these routes to your existing router.js file

// Get user dashboard data
router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Get user's search history, wishlist, and activity
    const dashboardData = {
      stats: {
        totalSearches: user.searchHistory?.length || 0,
        wishlistItems: user.wishlist?.length || 0,
        productsViewed: user.viewedProducts?.length || 0
      },
      recentSearches: user.searchHistory?.slice(-5) || [],
      recentActivity: user.activity?.slice(-10) || [],
      recommendations: user.recommendations || []
    };

    res.status(200).json({ dashboardData });
  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add search to user's history
router.post('/search-history', authenticate, async (req, res) => {
  const { query, category } = req.body;
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const searchEntry = {
      query,
      category,
      timestamp: new Date()
    };

    // Initialize searchHistory if it doesn't exist
    if (!user.searchHistory) user.searchHistory = [];

    // Add to beginning and limit to 50 entries
    user.searchHistory.unshift(searchEntry);
    user.searchHistory = user.searchHistory.slice(0, 50);


    // Add to activity
    if (!user.activity) user.activity = [];
    user.activity.unshift({
      activityType: 'search',  // Changed from 'type' to 'activityType'
      description: `Searched for "${query}"`,
      timestamp: new Date()
    });
    user.activity = user.activity.slice(0, 100);

    await user.save();
    res.status(200).json({ message: 'Search added to history' });
  } catch (error) {
    console.error('Search history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add product to wishlist
router.post('/wishlist', authenticate, async (req, res) => {
  const { productId, name, brand, price, originalPrice, image, store, rating, reviewCount, description } = req.body;
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.wishlist) user.wishlist = [];

    // Check if product already in wishlist
    const existingIndex = user.wishlist.findIndex(item => item.productId === productId);
    if (existingIndex !== -1) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }

    const wishlistItem = {
      productId,
      name,
      brand,
      price,
      originalPrice,
      image,
      store,
      rating,
      reviewCount,
      description,
      dateAdded: new Date()
    };

    user.wishlist.unshift(wishlistItem);

    // Add to activity
    // Add to activity
    if (!user.activity) user.activity = [];
    user.activity.unshift({
      activityType: 'wishlist_add',  // Changed from 'type' to 'activityType'
      description: `Added ${name} to wishlist`,
      timestamp: new Date()
    });
    user.activity = user.activity.slice(0, 100);

    await user.save();
    res.status(200).json({ message: 'Product added to wishlist', wishlist: user.wishlist });
  } catch (error) {
    console.error('Wishlist add error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove product from wishlist
router.delete('/wishlist/:productId', authenticate, async (req, res) => {
  const { productId } = req.params;
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.wishlist) user.wishlist = [];

    const itemIndex = user.wishlist.findIndex(item => item.productId === productId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Product not found in wishlist' });
    }

    const removedItem = user.wishlist[itemIndex];
    user.wishlist.splice(itemIndex, 1);

    // Add to activity
    // Add to activity (UPDATED)
    if (!user.activity) user.activity = [];
    user.activity.unshift({
      activityType: 'wishlist_remove',  // Changed from 'type' to 'activityType'
      description: `Removed ${removedItem.name} from wishlist`,
      timestamp: new Date()
    });
    user.activity = user.activity.slice(0, 100);

    await user.save();
    res.status(200).json({ message: 'Product removed from wishlist', wishlist: user.wishlist });
  } catch (error) {
    console.error('Wishlist remove error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's wishlist
router.get('/wishlist', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ wishlist: user.wishlist || [] });
  } catch (error) {
    console.error('Wishlist get error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add product view to user's history
router.post('/product-view', authenticate, async (req, res) => {
  const { productId, name, brand, price, image, store } = req.body;
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.viewedProducts) user.viewedProducts = [];

    // Remove if already exists to avoid duplicates
    user.viewedProducts = user.viewedProducts.filter(item => item.productId !== productId);

    // Add to beginning
    user.viewedProducts.unshift({
      productId,
      name,
      brand,
      price,
      image,
      store,
      viewedAt: new Date()
    });

    // Keep only last 100 viewed products
    user.viewedProducts = user.viewedProducts.slice(0, 100);

    await user.save();
    res.status(200).json({ message: 'Product view recorded' });
  } catch (error) {
    console.error('Product view error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});




module.exports = router;