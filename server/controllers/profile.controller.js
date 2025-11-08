const userService = require('../services/user.service');

class ProfileController {
  async getProfile(req, res) {
    try {
      const user = await userService.getProfile(req.user.userId);
      res.status(200).json({ user });
    } catch (err) {
      console.error(err);
      if (err.message === 'User not found') {
        return res.status(404).json({ message: err.message });
      }
      res.status(500).json({ message: 'Server error' });
    }
  }

  async updateProfile(req, res) {
    const { username, email, phone, location, bio, avatar } = req.body;

    try {
      const user = await userService.updateProfile(req.user.userId, {
        username,
        email,
        phone,
        location,
        bio,
        avatar
      });

      res.status(200).json({
        message: 'Profile updated successfully',
        user
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async uploadAvatar(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const baseUrl = process.env.NODE_ENV === 'production'
        ? `https://ssa-serverr.onrender.com/uploads/`
        : `http://localhost:5000/uploads/`;
      const avatarUrl = `${baseUrl}${req.file.filename}`;

      await userService.updateAvatar(req.user.userId, avatarUrl);

      res.status(200).json({
        message: 'Avatar updated successfully',
        avatar: avatarUrl,
      });
    } catch (error) {
      console.error('Avatar upload error:', error);

      if (error.message.includes('Only JPEG and PNG')) {
        return res.status(400).json({ message: error.message });
      }
      if (error.code === 'ENOENT') {
        return res.status(500).json({ message: 'Upload directory error' });
      }
      if (error.message === 'User not found') {
        return res.status(404).json({ message: error.message });
      }

      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
}

module.exports = new ProfileController();
