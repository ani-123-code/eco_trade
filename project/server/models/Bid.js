const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  auction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auction',
    required: true
  },
  bidder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  isWinning: {
    type: Boolean,
    default: false
  },
  isOutbid: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'won', 'lost'],
    default: 'active'
  },
  closedAt: {
    type: Date,
    default: null
  }
});

// Index for efficient queries
bidSchema.index({ auction: 1, timestamp: -1 });
bidSchema.index({ bidder: 1 });
bidSchema.index({ isWinning: 1 });

module.exports = mongoose.model('Bid', bidSchema);

