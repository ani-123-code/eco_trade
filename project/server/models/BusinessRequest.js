const mongoose = require('mongoose');

const businessRequestSchema = new mongoose.Schema({
  // Company Information
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  contactPersonName: {
    type: String,
    required: true,
    trim: true
  },
  designation: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  companyWebsite: {
    type: String,
    trim: true
  },
  gstNumber: {
    type: String,
    trim: true
  },

  // Address Information
  addressLine1: {
    type: String,
    required: true,
    trim: true
  },
  addressLine2: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  pincode: {
    type: String,
    required: true,
    trim: true
  },

  // Purchase Requirements
  productCategories: [{
    type: String,
    required: true
  }],
  quantityRange: {
    type: String,
    required: true,
    enum: ['10-50', '51-100', '101-500', '500+']
  },
  budgetRange: {
    type: String,
    required: true,
    enum: ['under-1L', '1L-5L', '5L-10L', '10L-25L', '25L+']
  },
  purchaseFrequency: {
    type: String,
    required: true,
    enum: ['one-time', 'monthly', 'quarterly', 'ongoing']
  },
  preferredBrands: {
    type: String,
    trim: true
  },
  specificRequirements: {
    type: String,
    required: true,
    trim: true
  },

  // Timeline & Delivery
  urgency: {
    type: String,
    required: true,
    enum: ['normal', 'urgent', 'immediate'],
    default: 'normal'
  },
  preferredDeliveryDate: {
    type: Date
  },

  // Business Details
  businessType: {
    type: String,
    required: true,
    enum: ['retailer', 'distributor', 'tech-company', 'startup', 'educational', 'corporate', 'government', 'other']
  },
  yearsInBusiness: {
    type: Number
  },
  paymentTerms: {
    type: String,
    enum: ['immediate', 'net-30', 'net-60', 'custom', '']
  },

  // Status & Admin Fields
  status: {
    type: String,
    enum: ['pending', 'contacted', 'quote-sent', 'negotiating', 'approved', 'rejected', 'completed'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    trim: true
  },
  quotedAmount: {
    type: Number
  },
  assignedTo: {
    type: String,
    trim: true
  },
  followUpDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
businessRequestSchema.index({ status: 1, createdAt: -1 });
businessRequestSchema.index({ email: 1 });
businessRequestSchema.index({ companyName: 1 });

const BusinessRequest = mongoose.model('BusinessRequest', businessRequestSchema);

module.exports = BusinessRequest;
