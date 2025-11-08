const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { JWT_SECRET, JWT_EXPIRES_IN, RESET_TOKEN_EXPIRES_IN } = require('../config/jwt');

class AuthService {
  async signup(username, email, password) {
    const userExists = await User.findOne({ email });
    if (userExists) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    return {
      username: newUser.username,
      email: newUser.email,
    };
  }

  async login(email, password) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return {
      token,
      user: {
        username: user.username,
        email: user.email,
      },
    };
  }

  async googleLogin(access_token) {
    const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    const googleUser = await response.json();

    if (!googleUser.email) {
      throw new Error('Failed to fetch user info from Google');
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
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return {
      token,
      user: {
        username: user.username,
        email: user.email,
      },
    };
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.isGoogleAccount) {
      throw new Error('Password changes are not allowed for Google accounts');
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    return { message: 'Password updated successfully' };
  }

  generateResetToken(userId) {
    return jwt.sign(
      { userId },
      JWT_SECRET,
      { expiresIn: RESET_TOKEN_EXPIRES_IN }
    );
  }

  verifyResetToken(token) {
    return jwt.verify(token, JWT_SECRET);
  }

  async resetPassword(userId, newPassword) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return { message: 'Password reset successful' };
  }
}

module.exports = new AuthService();
