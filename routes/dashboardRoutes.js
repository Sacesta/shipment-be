const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getShipmentAnalytics,
  getProductAnalytics
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(protect);

router.route('/stats')
  .get(getDashboardStats);

router.route('/analytics/shipments')
  .get(getShipmentAnalytics);

router.route('/analytics/products')
  .get(getProductAnalytics);

module.exports = router;
