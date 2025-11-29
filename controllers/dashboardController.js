const Shipment = require('../models/Shipment');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    // Get shipment statistics
    const totalShipments = await Shipment.countDocuments();
    const shipmentStatusCounts = await Shipment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get product statistics
    const totalProducts = await Product.countDocuments();
    const lowStockProducts = await Product.countDocuments({
      $expr: { $lte: ['$quantity', '$reorderLevel'] }
    });
    const outOfStockProducts = await Product.countDocuments({
      quantity: 0
    });

    // Get revenue statistics (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const revenueStats = await Shipment.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$shippingCost' },
          averageRevenue: { $avg: '$shippingCost' },
          shipmentCount: { $sum: 1 }
        }
      }
    ]);

    // Get recent shipments
    const recentShipments = await Shipment.find()
      .populate('courier', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get recent products
    const recentProducts = await Product.find()
      .sort({ createdAt: -1 })
      .limit(5);

    // Format shipment status counts
    const statusCounts = {};
    shipmentStatusCounts.forEach(item => {
      statusCounts[item._id] = item.count;
    });

    const stats = {
      shipments: {
        total: totalShipments,
        statusCounts: statusCounts,
        pending: statusCounts.pending || 0,
        inTransit: statusCounts.in_transit || 0,
        delivered: statusCounts.delivered || 0
      },
      products: {
        total: totalProducts,
        lowStock: lowStockProducts,
        outOfStock: outOfStockProducts
      },
      revenue: revenueStats[0] || {
        totalRevenue: 0,
        averageRevenue: 0,
        shipmentCount: 0
      },
      recent: {
        shipments: recentShipments,
        products: recentProducts
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard statistics',
      error: error.message
    });
  }
};

// @desc    Get shipment analytics
// @route   GET /api/dashboard/analytics/shipments
// @access  Private
const getShipmentAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    let days;
    switch (period) {
      case '7d':
        days = 7;
        break;
      case '30d':
        days = 30;
        break;
      case '90d':
        days = 90;
        break;
      default:
        days = 30;
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Shipments by status over time
    const shipmentsByStatus = await Shipment.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            status: '$status',
            date: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt'
              }
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.date': 1 }
      }
    ]);

    // Shipments by courier
    const shipmentsByCourier = await Shipment.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $lookup: {
          from: 'couriers',
          localField: 'courier',
          foreignField: '_id',
          as: 'courierInfo'
        }
      },
      {
        $unwind: '$courierInfo'
      },
      {
        $group: {
          _id: '$courierInfo.name',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$shippingCost' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Daily shipment trends
    const dailyTrends = await Shipment.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$shippingCost' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        shipmentsByStatus,
        shipmentsByCourier,
        dailyTrends,
        period
      }
    });
  } catch (error) {
    console.error('Get shipment analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching shipment analytics',
      error: error.message
    });
  }
};

// @desc    Get product analytics
// @route   GET /api/dashboard/analytics/products
// @access  Private
const getProductAnalytics = async (req, res) => {
  try {
    // Products by category
    const productsByCategory = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$price', '$quantity'] } }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Low stock alerts
    const lowStockAlerts = await Product.find({
      $expr: { $lte: ['$quantity', '$reorderLevel'] }
    }).sort({ quantity: 1 }).limit(10);

    // Top products by value
    const topProductsByValue = await Product.aggregate([
      {
        $addFields: {
          totalValue: { $multiply: ['$price', '$quantity'] }
        }
      },
      {
        $sort: { totalValue: -1 }
      },
      {
        $limit: 10
      },
      {
        $project: {
          name: 1,
          sku: 1,
          quantity: 1,
          price: 1,
          totalValue: 1,
          stockStatus: 1
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        productsByCategory,
        lowStockAlerts,
        topProductsByValue
      }
    });
  } catch (error) {
    console.error('Get product analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching product analytics',
      error: error.message
    });
  }
};

module.exports = {
  getDashboardStats,
  getShipmentAnalytics,
  getProductAnalytics
};
