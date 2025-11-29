const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
  trackingNumber: {
    type: String,
    unique: true,
    trim: true
  },
  customer: {
    type: Object,
    required: true
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    }
  }],
  package: {
    type: Object,
    required: true
  },
  payment: {
    type: Object,
    required: true
  },
  courier: {
    type: Object,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  estimatedDelivery: {
    type: Date
  },
  shippingCost: {
    type: Number,
    min: [0, 'Shipping cost cannot be negative']
  },
  trackingHistory: [{
    status: {
      type: String,
      required: true
    },
    location: String,
    description: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


// Generate tracking number before saving
shipmentSchema.pre('save', async function(next) {
  if (!this.trackingNumber) {
    const count = await mongoose.model('Shipment').countDocuments();
    this.trackingNumber = `SH${Date.now()}${count + 1}`;
  }
  next();
});

// Add initial tracking history when status changes
shipmentSchema.pre('save', function(next) {
  if (this.isModified('status') && this.trackingHistory.length === 0) {
    this.trackingHistory.push({
      status: this.status,
      location: 'Origin',
      description: 'Shipment created and ready for pickup'
    });
  }
  next();
});


module.exports = mongoose.model('Shipment', shipmentSchema);
