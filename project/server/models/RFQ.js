const mongoose = require('mongoose');

const rfqSchema = new mongoose.Schema({
  material: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quoteAmount: {
    type: Number,
    required: false,
    min: 0
  },
  message: {
    type: String,
    required: false,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'responded', 'accepted', 'rejected', 'cancelled', 'admin-approved', 'finalized'],
    default: 'pending'
  },
  adminApproved: {
    type: Boolean,
    default: false
  },
  adminApprovedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  adminApprovedAt: {
    type: Date,
    default: null
  },
  adminRejected: {
    type: Boolean,
    default: false
  },
  adminRejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  adminRejectedAt: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    default: null
  },
  adminNotes: {
    type: String,
    default: null,
    trim: true
  },
  sellerResponse: {
    quotedPrice: {
      type: Number,
      default: null,
      min: 0
    },
    message: {
      type: String,
      default: null,
      trim: true
    },
    respondedAt: {
      type: Date,
      default: null
    }
  },
  acceptedAt: {
    type: Date,
    default: null
  },
  rejectedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

rfqSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
rfqSchema.index({ material: 1 });
rfqSchema.index({ buyer: 1 });
rfqSchema.index({ status: 1 });
rfqSchema.index({ createdAt: -1 });

module.exports = mongoose.model('RFQ', rfqSchema);

