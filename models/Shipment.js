const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
  trackingNumber: {
    type: String,
    required: [true, 'Tracking number is required'],
    unique: true,
    trim: true
  },
  sender: {
    name: {
      type: String,
      required: [true, 'Sender name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Sender email is required'],
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: [true, 'Sender phone is required'],
      trim: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },
  receiver: {
    name: {
      type: String,
      required: [true, 'Receiver name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Receiver email is required'],
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: [true, 'Receiver phone is required'],
      trim: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },
  package: {
    description: {
      type: String,
      required: [true, 'Package description is required'],
      trim: true
    },
    weight: {
      type: Number,
      required: [true, 'Package weight is required'],
      min: [0.1, 'Weight must be at least 0.1 kg']
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    value: {
      type: Number,
      min: [0, 'Value cannot be negative']
    }
  },
  courier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Courier',
    required: [true, 'Courier is required']
  },
  status: {
    type: String,
    enum: ['pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  estimatedDelivery: {
    type: Date
  },
  actualDelivery: {
    type: Date
  },
  shippingCost: {
    type: Number,
    required: [true, 'Shipping cost is required'],
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
  timestamps: true
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
