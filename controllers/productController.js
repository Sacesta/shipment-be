const Product = require('../models/Product');

// @desc    Create a new product
// @route   POST /api/products
// @access  Private
const createProduct = async (req, res) => {
  try {
    const {
      name,
      sku,
      weight,
      dimensions,
      stock
    } = req.body;

    const product = await Product.create({
      name,
      sku,
      weight,
      dimensions,
      stock,
      createdBy: req.user.id
    });


    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('Create product error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'SKU already exists'
      });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error during product creation',
      error: error.message
    });
  }
};


// @desc    Get all products
// @route   GET /api/products
// @access  Private
const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    // Search by name or SKU
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }


    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const products = await Product.find(query)
      .populate('createdBy', 'name email')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: products,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching products',
      error: error.message
    });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Private
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching product',
      error: error.message
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
const updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Validate dimensions if provided
    if (req.body.dimensions) {
      const { length, width, height } = req.body.dimensions;
      if ((length && length < 0) || (width && width < 0) || (height && height < 0)) {
        return res.status(400).json({
          success: false,
          message: 'Dimensions cannot be negative'
        });
      }
    }

    product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Update product error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'SKU already exists'
      });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while updating product',
      error: error.message
    });
  }
};


// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting product',
      error: error.message
    });
  }
};

// @desc    Update product stock (for inventory management)
// @route   PATCH /api/products/:id/stock
// @access  Private
const updateProductStock = async (req, res) => {
  try {
    const { stock, operation = 'set' } = req.body;

    if (typeof stock !== 'number' || stock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock must be a non-negative number'
      });
    }

    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    let newStock;
    switch (operation) {
      case 'add':
        newStock = product.stock + stock;
        break;
      case 'subtract':
        newStock = product.stock - stock;
        if (newStock < 0) {
          return res.status(400).json({
            success: false,
            message: 'Insufficient stock'
          });
        }
        break;
      case 'set':
      default:
        newStock = stock;
        break;
    }

    product = await Product.findByIdAndUpdate(
      req.params.id,
      { stock: newStock },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Product stock updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Update product stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating product stock',
      error: error.message
    });
  }
};
module.exports = {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  updateProductStock
};
