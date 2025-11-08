const authService = require('../services/auth.service');
const emailService = require('../services/email.service');
const User = require('../models/user.model');

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

    console.log('Password change request:', {
      currentPassword: !!currentPassword,
      newPassword: !!newPassword
    });

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new passwords are required' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters' });
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

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const resetToken = authService.generateResetToken(user._id);
      const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

      await emailService.sendPasswordResetEmail(email, resetLink);

      return res.json({ message: 'Password reset link sent to email' });
    } catch (err) {
      console.error('Forgot password error:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  }

  async resetPassword(req, res) {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters' });
    }

    try {
      const decoded = authService.verifyResetToken(token);
      const result = await authService.resetPassword(decoded.userId, newPassword);

      return res.json(result);
    } catch (err) {
      console.error('Reset password error:', err);
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
  }
}

module.exports = new AuthController();
