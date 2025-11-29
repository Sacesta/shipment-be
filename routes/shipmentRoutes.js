const express = require('express');
const router = express.Router();
const {
  createShipment,
  getShipments,
  getShipment,
  updateShipment,
  deleteShipment,
  trackShipment
} = require('../controllers/shipmentController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/track/:trackingNumber', trackShipment);

// Protected routes (require authentication)
router.use(protect);

router.route('/')
  .post(createShipment)
  .get(getShipments);

router.route('/:id')
  .get(getShipment)
  .put(updateShipment)
  .delete(deleteShipment);

module.exports = router;
