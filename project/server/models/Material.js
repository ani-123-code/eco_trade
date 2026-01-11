const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: false,
    trim: true
  },
    category: {
      type: String,
      enum: ['ewaste', 'fmgc', 'metal', 'plastics', 'paper', 'textile', 'other', 'software', 'machines'],
      required: true
    },
  // Type field to distinguish between regular materials and special types
  itemType: {
    type: String,
    enum: ['material', 'machine', 'software'],
    default: 'material'
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    default: 'kg',
    enum: ['kg', 'ton', 'piece', 'unit']
  },
  images: [{
    type: String
  }],
  location: {
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    address: { type: String, required: false }
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  listingType: {
    type: String,
    enum: ['auction', 'rfq'],
    default: 'auction',
    required: true
  },
  // Auction-specific fields
  startingPrice: {
    type: Number,
    required: function() {
      return this.listingType === 'auction';
    },
    min: 0
  },
  reservePrice: {
    type: Number,
    required: false,
    min: 0
  },
  auctionEndTime: {
    type: Date,
    required: function() {
      return this.listingType === 'auction';
    }
  },
  // Status
  status: {
    type: String,
    enum: ['pending', 'active', 'sold', 'cancelled', 'expired'],
    default: 'pending'
  },
  // Admin verification
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  // Additional fields
  condition: {
    type: String,
    enum: ['new', 'good', 'fair', 'scrap'],
    default: 'good'
  },
  specifications: {
    type: Map,
    of: String
  },
  
  // Category-specific fields - E-Waste
  ewasteType: { type: String, enum: ['IT equipment', 'Consumer electronics', 'Industrial electronics'] },
  workingCondition: { type: String, enum: ['Working', 'Non-working', 'Mixed'] },
  approxYear: { type: String },
  hazardousComponentsPresent: { type: String, enum: ['Yes', 'No'] },
  dataCleared: { type: String, enum: ['Yes', 'No', 'Not applicable'] },
  weighmentMethod: { type: String, enum: ['Seller', 'Buyer', 'Third-party'] },
  brandList: { type: String },
  batteryIncluded: { type: String, enum: ['Yes', 'No'] },
  pcbGrade: { type: String, enum: ['Low', 'Medium', 'High'] },
  
  // Category-specific fields - Metal
  metalType: { type: String, enum: ['Copper', 'Aluminum', 'Steel', 'Brass', 'Mixed'] },
  gradePurity: { type: String },
  form: { type: String, enum: ['Wire', 'Sheet', 'Pipe', 'Turning', 'Mixed'] },
  contaminationPresent: { type: String, enum: ['Yes', 'No'] },
  oilGreasePresent: { type: String, enum: ['Yes', 'No'] },
  magnetTestPassed: { type: String },
  
  // Category-specific fields - Plastics
  plasticType: { type: String, enum: ['PET', 'HDPE', 'LDPE', 'PP', 'Mixed'] },
  plasticForm: { type: String, enum: ['Granules', 'Scrap', 'Bales', 'Regrind'] },
  cleanliness: { type: String, enum: ['Clean', 'Semi-clean', 'Dirty'] },
  color: { type: String, enum: ['Natural', 'Mixed', 'Specific color'] },
  moistureLevel: { type: String },
  foodGrade: { type: String, enum: ['Yes', 'No'] },
  
  // Category-specific fields - Paper
  paperType: { type: String, enum: ['OCC', 'Newspaper', 'Office paper', 'Mixed'] },
  paperCondition: { type: String, enum: ['Dry', 'Semi-wet', 'Wet'] },
  baledOrLoose: { type: String, enum: ['Baled', 'Loose'] },
  paperContaminationPresent: { type: String, enum: ['Yes', 'No'] },
  approxGSM: { type: String },
  storageCondition: { type: String },
  
  // Category-specific fields - Textile
  textileType: { type: String, enum: ['Cotton', 'Polyester', 'Mixed', 'Fabric scrap'] },
  textileForm: { type: String, enum: ['Clips', 'Rags', 'Rolls', 'Cut pieces'] },
  textileCleanliness: { type: String, enum: ['Clean', 'Semi-clean', 'Dirty'] },
  reusableOrRecyclingGrade: { type: String, enum: ['Reusable', 'Recycling Grade'] },
  colorSortingAvailable: { type: String, enum: ['Yes', 'No'] },
  
  // Category-specific fields - FMCG
  productType: { type: String, enum: ['Food', 'Personal care', 'Household'] },
  expiryDate: { type: Date },
  packagingCondition: { type: String, enum: ['Sealed', 'Damaged', 'Open box'] },
  returnDamageReason: { type: String },
  batchQuantity: { type: String },
  brand: { type: String },
  mrp: { type: Number },
  
  // Category-specific fields - Other
  materialDescription: { type: String },
  intendedUseNature: { type: String },
  specialHandlingRequired: { type: String, enum: ['Yes', 'No'] },
  
  // Compliance & Legal checkboxes
  sellerConfirmsOwnership: { type: Boolean, default: false },
  materialCompliesWithLaws: { type: Boolean, default: false },
  buyerResponsibleForTransport: { type: Boolean, default: false },
  platformNotLiableForDisputes: { type: Boolean, default: false },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

materialSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for efficient queries
materialSchema.index({ category: 1, status: 1 });
materialSchema.index({ seller: 1 });
materialSchema.index({ listingType: 1, status: 1 });
materialSchema.index({ auctionEndTime: 1 });

module.exports = mongoose.model('Material', materialSchema);

