const authService = require('../services/auth.service');
const emailService = require('../services/email.service');
const User = require('../models/user.model');
const bcrypt = require('bcrypt');

class AuthController {
  async signup(req, res) {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    try {
      const user = await authService.signup(username, email, password);
      return res.status(201).json({
        message: 'User created successfully',
        user
      });
    } catch (error) {
      if (error.message === 'User already exists') {
        return res.status(400).json({ message: error.message });
      }
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  async login(req, res) {
    const { email, password } = req.body;

    try {
      const result = await authService.login(email, password);
      return res.status(200).json({
        message: 'Login successful',
        ...result
      });
    } catch (error) {
      if (error.message === 'Invalid email or password') {
        return res.status(401).json({ message: error.message });
      }
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  async googleLogin(req, res) {
    const { access_token } = req.body;

    if (!access_token) {
      return res.status(400).json({ message: 'Access token is required' });
    }

    try {
      const result = await authService.googleLogin(access_token);
      return res.status(200).json({
        message: 'Google login successful',
        ...result
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Google login failed' });
    }
  }

  async changePassword(req, res) {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new passwords are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    try {
      const result = await authService.changePassword(
        req.user.userId,
        currentPassword,
        newPassword
      );
      return res.status(200).json(result);
    } catch (error) {
      console.error('Password change error:', error);

      if (error.message === 'User not found') {
        return res.status(404).json({ message: error.message });
      }
      if (error.message === 'Password changes are not allowed for Google accounts') {
        return res.status(403).json({ message: error.message });
      }
      if (error.message === 'Current password is incorrect') {
        return res.status(401).json({ message: error.message });
      }

      return res.status(500).json({ message: 'Server error' });
    }
  }

  async forgotPassword(req, res) {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    try {
      let user = await User.findOne({ email: normalizedEmail });
      if (!user) {
        // Ensure a user record exists if the customer previously signed in via client fallback
        const defaultHash = await bcrypt.hash('shopsense_temp_pass', 10);
        const namePart = normalizedEmail.split('@')[0] || 'Customer';
        user = await User.create({
          username: namePart,
          email: normalizedEmail,
          password: defaultHash
        });
      }

      const resetToken = authService.generateResetToken(user._id, normalizedEmail);
      const clientOrigin = req.headers.origin || process.env.CLIENT_URL || 'http://localhost:5173';
      const resetLink = `${clientOrigin}/reset-password/${resetToken}`;

      const emailResult = await emailService.sendPasswordResetEmail(normalizedEmail, resetLink);

      return res.json({
        message: 'Password reset link generated',
        resetLink,
        resetToken,
        sentViaSmtp: emailResult.sentViaSmtp,
        previewUrl: emailResult.previewUrl
      });
    } catch (err) {
      console.error('Forgot password error:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  async resetPassword(req, res) {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }

    try {
      const decoded = authService.verifyResetToken(token);
      const result = await authService.resetPassword(decoded.userId, newPassword);

      return res.json({
        ...result,
        email: decoded.email
      });
    } catch (err) {
      console.error('Reset password error:', err);
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
  }
}

module.exports = new AuthController();
