const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  updateProductQuantity,
  getProductCategories
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes
router.use(protect);

router.route('/')
  .post(createProduct)
  .get(getProducts);

router.route('/categories')
  .get(getProductCategories);

router.route('/:id')
  .get(getProduct)
  .put(updateProduct)
  .delete(deleteProduct);

router.route('/:id/quantity')
  .patch(updateProductQuantity);

module.exports = router;
