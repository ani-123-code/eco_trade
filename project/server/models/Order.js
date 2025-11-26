const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  total: { type: Number, required: true },
  shippingAddress: {
    fullName: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
    country: { type: String, default: 'India' }
  },
  paymentMethod: { type: String, required: true },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  paymentId: String,
  orderStatus: {
  type: String,
  enum: ['processing', 'shipped', 'delivered', 'cancelled'],
  default: 'processing'
},
statusHistory: [{
  status: {
    type: String,
    enum: ['processing', 'shipped', 'delivered', 'cancelled'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notificationSent: {
    type: Boolean,
    default: false
  },
  customerNotified: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    default: ''
  }
}],
  lastStatusUpdate: {
    type: Date,
    default: Date.now
  },
  statusNotifications: [{
    status: String,
    sentAt: Date,
    method: {
      type: String,
      enum: ['email', 'sms', 'push'],
      default: 'email'
    },
    success: Boolean,
    errorMessage: String
  }],
  adminNotes: {
    type: String,
    default: ''
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: { type: Date, default: Date.now }
});

// Static method to generate unique order ID with SVN prefix and serial numbers
orderSchema.statics.generateOrderId = async function() {
  let orderId;
  let isUnique = false;
  
  while (!isUnique) {
    // Find the highest existing order number
    const lastOrder = await this.findOne(
      { orderId: { $regex: /^SVN\d{5}$/ } },
      { orderId: 1 },
      { sort: { orderId: -1 } }
    );
    
    let nextNumber = 1;
    if (lastOrder && lastOrder.orderId) {
      // Extract the number part and increment
      const currentNumber = parseInt(lastOrder.orderId.substring(3));
      nextNumber = currentNumber + 1;
    }
    
    // Format as SVN + 5-digit number (padded with zeros)
    orderId = 'SVN' + nextNumber.toString().padStart(5, '0');
    
    // Double check uniqueness (in case of race conditions)
    const existingOrder = await this.findOne({ orderId });
    if (!existingOrder) {
      isUnique = true;
    }
  }

  return orderId;
};

// Pre-save middleware to generate orderId
orderSchema.pre('save', async function(next) {
  try {
    // Only generate orderId if it's a new document and orderId is not set
    if (this.isNew && !this.orderId) {
      this.orderId = await this.constructor.generateOrderId();
    }
    next();
  } catch (error) {
    next(error);
  }
});


orderSchema.pre('save', function(next) {
  if (this.isModified('orderStatus') && !this.isNew) {
    // Update last status update timestamp
    this.lastStatusUpdate = new Date();
    
    // Add to status history
    this.statusHistory.push({
      status: this.orderStatus,
      timestamp: new Date(),
      updatedBy: this.lastUpdatedBy,
      notificationSent: false,
      customerNotified: false
    });
  }
  next();
});

// Virtual for display ID (optional)
orderSchema.virtual('displayId').get(function() {
  return this.orderId;
});

orderSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Order', orderSchema);