const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');
const authenticate = require('../middleware/auth.middleware');
const upload = require('../config/multer');

router.get('/profile', authenticate, profileController.getProfile.bind(profileController));
router.put('/profile', authenticate, profileController.updateProfile.bind(profileController));
router.put('/avatar', authenticate, upload.single('avatar'), profileController.uploadAvatar.bind(profileController));

module.exports = router;
