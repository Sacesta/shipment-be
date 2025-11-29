const express = require('express');
const router = express.Router();
const {
  createCourier,
  getCouriers,
  getCourier,
  updateCourier,
  deleteCourier,
  getActiveCouriers,
  calculateShippingCost
} = require('../controllers/courierController');
const { protect } = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(protect);

router.route('/')
  .post(createCourier)
  .get(getCouriers);

router.route('/active/list')
  .get(getActiveCouriers);

router.route('/calculate-shipping')
  .post(calculateShippingCost);

router.route('/:id')
  .get(getCourier)
  .put(updateCourier)
  .delete(deleteCourier);

module.exports = router;
