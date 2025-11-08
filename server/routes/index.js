const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const profileRoutes = require('./profile.routes');
const wishlistRoutes = require('./wishlist.routes');
const dashboardRoutes = require('./dashboard.routes');

router.get('/', (req, res) => {
  res.send('Hello World from Home');
});

router.use('/', authRoutes);
router.use('/', profileRoutes);
router.use('/', wishlistRoutes);
router.use('/', dashboardRoutes);

module.exports = router;
