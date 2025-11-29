const Shipment = require('../models/Shipment');
const Courier = require('../models/Courier');

// @desc    Create a new shipment
// @route   POST /api/shipments
// @access  Private
const createShipment = async (req, res) => {
  try {
    const {
      sender,
      receiver,
      package,
      courier,
      estimatedDelivery,
      shippingCost,
      notes
    } = req.body;

    // Verify courier exists
    const courierExists = await Courier.findById(courier);
    if (!courierExists) {
      return res.status(400).json({
        success: false,
        message: 'Invalid courier selected'
      });
    }

    const shipment = await Shipment.create({
      sender,
      receiver,
      package,
      courier,
      estimatedDelivery,
      shippingCost,
      notes,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Shipment created successfully',
      data: shipment
    });
  } catch (error) {
    console.error('Create shipment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during shipment creation',
      error: error.message
    });
  }
};

// @desc    Get all shipments
// @route   GET /api/shipments
// @access  Private
const getShipments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    // Search by tracking number or sender/receiver name
    if (search) {
      query.$or = [
        { trackingNumber: { $regex: search, $options: 'i' } },
        { 'sender.name': { $regex: search, $options: 'i' } },
        { 'receiver.name': { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const shipments = await Shipment.find(query)
      .populate('courier', 'name code')
      .populate('createdBy', 'name email')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Shipment.countDocuments(query);

    res.json({
      success: true,
      data: shipments,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get shipments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching shipments',
      error: error.message
    });
  }
};

// @desc    Get single shipment
// @route   GET /api/shipments/:id
// @access  Private
const getShipment = async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id)
      .populate('courier')
      .populate('createdBy', 'name email');

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    res.json({
      success: true,
      data: shipment
    });
  } catch (error) {
    console.error('Get shipment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching shipment',
      error: error.message
    });
  }
};

// @desc    Update shipment
// @route   PUT /api/shipments/:id
// @access  Private
const updateShipment = async (req, res) => {
  try {
    const {
      sender,
      receiver,
      package,
      courier,
      status,
      estimatedDelivery,
      shippingCost,
      notes
    } = req.body;

    let shipment = await Shipment.findById(req.params.id);

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    // If status is changing, add to tracking history
    if (status && status !== shipment.status) {
      const trackingUpdate = {
        status: status,
        location: 'In transit',
        description: `Status updated to ${status}`
      };

      if (status === 'delivered') {
        trackingUpdate.location = 'Destination';
        trackingUpdate.description = 'Package delivered successfully';
        req.body.actualDelivery = new Date();
      }

      req.body.trackingHistory = [
        ...shipment.trackingHistory,
        trackingUpdate
      ];
    }

    shipment = await Shipment.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    ).populate('courier').populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Shipment updated successfully',
      data: shipment
    });
  } catch (error) {
    console.error('Update shipment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating shipment',
      error: error.message
    });
  }
};

// @desc    Delete shipment
// @route   DELETE /api/shipments/:id
// @access  Private
const deleteShipment = async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id);

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found'
      });
    }

    await Shipment.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Shipment deleted successfully'
    });
  } catch (error) {
    console.error('Delete shipment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting shipment',
      error: error.message
    });
  }
};

// @desc    Track shipment by tracking number
// @route   GET /api/shipments/track/:trackingNumber
// @access  Public
const trackShipment = async (req, res) => {
  try {
    const shipment = await Shipment.findOne({ 
      trackingNumber: req.params.trackingNumber 
    }).populate('courier', 'name trackingUrl');

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found with this tracking number'
      });
    }

    res.json({
      success: true,
      data: shipment
    });
  } catch (error) {
    console.error('Track shipment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while tracking shipment',
      error: error.message
    });
  }
};

module.exports = {
  createShipment,
  getShipments,
  getShipment,
  updateShipment,
  deleteShipment,
  trackShipment
};
