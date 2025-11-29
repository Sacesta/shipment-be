const Courier = require('../models/Courier');

// @desc    Create a new courier
// @route   POST /api/couriers
// @access  Private
const createCourier = async (req, res) => {
  try {
    const {
      name,
      code,
      description,
      contact,
      serviceTypes,
      pricing,
      deliveryAreas,
      estimatedDeliveryDays,
      trackingUrl
    } = req.body;

    const courier = await Courier.create({
      name,
      code,
      description,
      contact,
      serviceTypes,
      pricing,
      deliveryAreas,
      estimatedDeliveryDays,
      trackingUrl,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Courier created successfully',
      data: courier
    });
  } catch (error) {
    console.error('Create courier error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Courier name or code already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error during courier creation',
      error: error.message
    });
  }
};

// @desc    Get all couriers
// @route   GET /api/couriers
// @access  Private
const getCouriers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    const query = {};

    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    // Search by name or code
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const couriers = await Courier.find(query)
      .populate('createdBy', 'name email')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Courier.countDocuments(query);

    res.json({
      success: true,
      data: couriers,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get couriers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching couriers',
      error: error.message
    });
  }
};

// @desc    Get single courier
// @route   GET /api/couriers/:id
// @access  Private
const getCourier = async (req, res) => {
  try {
    const courier = await Courier.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!courier) {
      return res.status(404).json({
        success: false,
        message: 'Courier not found'
      });
    }

    res.json({
      success: true,
      data: courier
    });
  } catch (error) {
    console.error('Get courier error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching courier',
      error: error.message
    });
  }
};

// @desc    Update courier
// @route   PUT /api/couriers/:id
// @access  Private
const updateCourier = async (req, res) => {
  try {
    let courier = await Courier.findById(req.params.id);

    if (!courier) {
      return res.status(404).json({
        success: false,
        message: 'Courier not found'
      });
    }

    courier = await Courier.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Courier updated successfully',
      data: courier
    });
  } catch (error) {
    console.error('Update courier error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Courier name or code already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while updating courier',
      error: error.message
    });
  }
};

// @desc    Delete courier
// @route   DELETE /api/couriers/:id
// @access  Private
const deleteCourier = async (req, res) => {
  try {
    const courier = await Courier.findById(req.params.id);

    if (!courier) {
      return res.status(404).json({
        success: false,
        message: 'Courier not found'
      });
    }

    // Check if courier is being used in shipments
    const Shipment = require('../models/Shipment');
    const shipmentCount = await Shipment.countDocuments({ courier: req.params.id });

    if (shipmentCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete courier that is being used in shipments'
      });
    }

    await Courier.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Courier deleted successfully'
    });
  } catch (error) {
    console.error('Delete courier error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting courier',
      error: error.message
    });
  }
};

// @desc    Get active couriers (for dropdowns)
// @route   GET /api/couriers/active/list
// @access  Private
const getActiveCouriers = async (req, res) => {
  try {
    const couriers = await Courier.find({ status: 'active' })
      .select('name code serviceTypes pricing estimatedDeliveryDays')
      .sort({ name: 1 });

    res.json({
      success: true,
      data: couriers
    });
  } catch (error) {
    console.error('Get active couriers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching active couriers',
      error: error.message
    });
  }
};

// @desc    Calculate shipping cost
// @route   POST /api/couriers/calculate-shipping
// @access  Private
const calculateShippingCost = async (req, res) => {
  try {
    const { courierId, weight, distance = 0 } = req.body;

    const courier = await Courier.findById(courierId);
    
    if (!courier) {
      return res.status(404).json({
        success: false,
        message: 'Courier not found'
      });
    }

    const { baseRate, weightRate, distanceRate } = courier.pricing;
    
    let totalCost = baseRate;
    
    // Add weight-based cost
    if (weight && weightRate > 0) {
      totalCost += weight * weightRate;
    }
    
    // Add distance-based cost
    if (distance && distanceRate > 0) {
      totalCost += distance * distanceRate;
    }

    res.json({
      success: true,
      data: {
        courier: courier.name,
        baseRate,
        weightRate,
        distanceRate,
        calculatedCost: Math.round(totalCost * 100) / 100, // Round to 2 decimal places
        estimatedDeliveryDays: courier.estimatedDeliveryDays
      }
    });
  } catch (error) {
    console.error('Calculate shipping cost error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while calculating shipping cost',
      error: error.message
    });
  }
};

module.exports = {
  createCourier,
  getCouriers,
  getCourier,
  updateCourier,
  deleteCourier,
  getActiveCouriers,
  calculateShippingCost
};
