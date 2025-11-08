const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const authenticate = require('../middleware/auth.middleware');

router.get('/dashboard', authenticate, dashboardController.getDashboard.bind(dashboardController));
router.post('/search-history', authenticate, dashboardController.addSearchHistory.bind(dashboardController));
router.post('/product-view', authenticate, dashboardController.addProductView.bind(dashboardController));

module.exports = router;
