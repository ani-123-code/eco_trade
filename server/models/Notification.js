const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: [
      'bid-placed',
      'bid-outbid',
      'bid-won',
      'bid-lost',
      'auction-created',
      'auction-approved',
      'auction-ended',
      'auction-scheduled',
      'token-payment-required',
      'token-payment-reminder',
      'token-payment-received',
      'seller-bid-accepted',
      'admin-bid-approved',
      'rfq-request',
      'rfq-response',
      'material-verified',
      'material-rejected',
      'auction-rejected',
      'auction-cancelled',
      'user-warning'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedAuction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auction',
    default: null
  },
  relatedMaterial: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Material',
    default: null
  },
  relatedBid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bid',
    default: null
  },
  relatedRFQ: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RFQ',
    default: null
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date,
    default: null
  },
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for efficient queries
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);

