const mongoose = require('mongoose');

const repairRequestSchema = new mongoose.Schema({
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
  deviceType: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  problemDescription: {
    type: String,
    required: true
  },
  urgency: {
    type: String,
    required: true,
    enum: ['normal', 'urgent', 'emergency']
  },
  preferredDate: {
    type: Date
  },
  warrantyStatus: {
    type: String,
    enum: ['under-warranty', 'expired', 'no-warranty']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  adminNotes: {
    type: String
  },
  estimatedCost: {
    type: Number
  },
  actualCost: {
    type: Number
  },
  completionDate: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('RepairRequest', repairRequestSchema);
