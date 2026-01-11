const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
  material: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    required: true
  },
  currentBid: {
    type: Number,
    default: 0,
    min: 0
  },
  currentBidder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  bidCount: {
    type: Number,
    default: 0
  },
  endTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'active', 'ended', 'cancelled', 'admin-approved', 'seller-approved', 'completed'],
    default: 'draft'
  },
  isDraft: {
    type: Boolean,
    default: true
  },
  scheduledPublishDate: {
    type: Date,
    default: null
  },
  publishedAt: {
    type: Date,
    default: null
  },
  tokenAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  tokenPaid: {
    type: Boolean,
    default: false
  },
  tokenPaidAt: {
    type: Date,
    default: null
  },
  tokenPaymentDeadline: {
    type: Date,
    default: null
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
  sellerApproved: {
    type: Boolean,
    default: false
  },
  sellerApprovedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  sellerApprovedAt: {
    type: Date,
    default: null
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  purchaseOrder: {
    type: String,
    default: null,
    trim: true
  },
  reservePrice: {
    type: Number,
    default: null,
    min: 0
  },
  startingPrice: {
    type: Number,
    required: true,
    min: 0
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

auctionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
auctionSchema.index({ material: 1 });
auctionSchema.index({ status: 1, endTime: 1 });
auctionSchema.index({ currentBidder: 1 });
auctionSchema.index({ winner: 1 });

module.exports = mongoose.model('Auction', auctionSchema);

