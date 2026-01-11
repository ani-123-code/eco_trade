const mongoose = require('mongoose');

const recycleRequestSchema = new mongoose.Schema({
  userType: {
    type: String,
    required: true,
    enum: ['individual', 'corporate']
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  addressLine1: {
    type: String,
    required: true
  },
  addressLine2: {
    type: String
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  pincode: {
    type: String,
    required: true
  },
  ewasteItems: {
    type: String,
    required: true
  },
  pickupDate: {
    type: Date,
    required: true
  },
  companyName: {
    type: String
  },
  gstNumber: {
    type: String
  },
  estimatedQuantity: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'scheduled', 'picked-up', 'completed', 'cancelled'],
    default: 'pending'
  },
  adminNotes: {
    type: String
  },
  actualPickupDate: {
    type: Date
  },
  certificateIssued: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('RecycleRequest', recycleRequestSchema);
