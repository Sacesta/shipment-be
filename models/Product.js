const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    trim: true,
    uppercase: true,
    maxlength: [50, 'SKU cannot exceed 50 characters']
  },
  weight: {
    type: Number,
    min: [0, 'Weight cannot be negative'],
    default: 0
  },
  dimensions: {
    length: { type: Number, min: 0, default: 0 },
    width: { type: Number, min: 0, default: 0 },
    height: { type: Number, min: 0, default: 0 }
  },
  stock: {
    type: Number,
    required: [true, 'Stock is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});


// Generate SKU before saving if not provided
productSchema.pre('save', async function(next) {
  if (!this.sku) {
    const count = await mongoose.model('Product').countDocuments();
    this.sku = `PROD${Date.now().toString().slice(-6)}${(count + 1).toString().padStart(3, '0')}`;
  }
  
  // Auto-generate barcode if not provided
  if (!this.barcode && this.sku) {
    this.barcode = this.sku;
  }
  
  next();
});


// Virtual for profit margin
productSchema.virtual('profitMargin').get(function() {
  if (this.price && this.cost) {
    return ((this.price - this.cost) / this.price * 100).toFixed(2);
  }
  return 0;
});

// Virtual for stock status
productSchema.virtual('stockStatus').get(function() {
  if (this.quantity === 0) {
    return 'out_of_stock';
  } else if (this.quantity <= this.reorderLevel) {
    return 'low_stock';
  } else {
    return 'in_stock';
  }
});

// Ensure virtual fields are serialized
productSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
