const mongoose = require('mongoose');

const courierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Courier name is required'],
    trim: true,
    unique: true
  },
  code: {
    type: String,
    required: [true, 'Courier code is required'],
    trim: true,
    uppercase: true,
    unique: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot be more than 200 characters']
  },
  contact: {
    phone: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    website: {
      type: String,
      trim: true
    }
  },
  serviceTypes: [{
    type: String,
    enum: ['standard', 'express', 'overnight', 'international', 'same_day']
  }],
  pricing: {
    baseRate: {
      type: Number,
      required: [true, 'Base rate is required'],
      min: [0, 'Base rate cannot be negative']
    },
    weightRate: {
      type: Number,
      default: 0,
      min: [0, 'Weight rate cannot be negative']
    },
    distanceRate: {
      type: Number,
      default: 0,
      min: [0, 'Distance rate cannot be negative']
    }
  },
  deliveryAreas: [{
    country: String,
    state: String,
    city: String,
    zipCodes: [String]
  }],
  estimatedDeliveryDays: {
    min: {
      type: Number,
      default: 1,
      min: [1, 'Minimum delivery days must be at least 1']
    },
    max: {
      type: Number,
      default: 7,
      min: [1, 'Maximum delivery days must be at least 1']
    }
  },
  trackingUrl: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Generate code before saving if not provided
courierSchema.pre('save', async function(next) {
  if (!this.code) {
    const count = await mongoose.model('Courier').countDocuments();
    this.code = `CR${(count + 1).toString().padStart(3, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Courier', courierSchema);
