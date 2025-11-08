const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authenticate = require('../middleware/auth.middleware');

router.post('/signup', authController.signup.bind(authController));
router.post('/login', authController.login.bind(authController));
router.post('/google-login', authController.googleLogin.bind(authController));
router.put('/password', authenticate, authController.changePassword.bind(authController));
router.post('/forgot-password', authController.forgotPassword.bind(authController));
router.post('/reset-password/:token', authController.resetPassword.bind(authController));

module.exports = router;
