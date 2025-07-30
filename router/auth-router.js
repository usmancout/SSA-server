const express = require('express');
const router = express.Router();
const User = require('../user-schema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Helper function to authenticate user with JWT
const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', ''); // Extract token from Authorization header
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, 'hellomoto'); // Verify JWT token
    req.user = decoded; // Attach user data to request
    next();
  } catch (error) {
    return res.status(400).json({ message: 'Invalid token.' });
  }
};

// Existing route for signup
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  // Basic validation
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


// Login route (using JWT for authentication)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Compare the entered password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username, email: user.email },
      'hellomoto', // Replace with a secure secret key
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    // Send a success response with the token and user info
    return res.status(200).json({
      message: 'Login successful',
      token: token,
      user: {
        username: user.username, // Use the username from the user object
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
    // Fetch user info from Google APIs
    const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const googleUser = await response.json();

    if (!googleUser.email) {
      return res.status(400).json({ message: 'Failed to fetch user info from Google' });
    }

    // Check if user exists
    let user = await User.findOne({ email: googleUser.email });

    if (!user) {
      // If not, create a new user with random password since it won't be used
      const hashedPassword = await bcrypt.hash('shopsense_google_default_password', 10);
      user = await User.create({
        username: googleUser.name || 'Google User',
        email: googleUser.email,
        password: hashedPassword,
      });
    }

    // Generate JWT token
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


// change password route
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
