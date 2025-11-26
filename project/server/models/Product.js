const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productCode: {  
    type: String,  
    unique: true,  
    sparse: true,  
    uppercase: true,
    trim: true
  },
  name: { type: String, required: true },
  description: { type: String, required: false },
  price: { type: Number, required: true },
  discountPrice: Number,
  collection: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection',
    required: true
  },
  condition: {
    type: String,
    enum: ['Like New', 'Excellent', 'Good', 'Fair'],
    required: true,
    default: 'Good'
  },
  refurbishmentDetails: { 
    type: String,
    default: 'Professionally refurbished and quality tested'
  },
  originalPrice: { type: Number }, // Original retail price for comparison
  warranty: { type: String, required: true }, 
  bestSeller: { type: Boolean, default: false }, 
  type: { type: mongoose.Schema.Types.ObjectId, ref: 'Type', required: true },
  image: { type: String },
  images: [String],
  features: [String],
  specifications: { type: Map, of: String },
  stock: { type: Number, default: 0 },
  qualityCheckPoints: { type: Number, default: 41 },
  reviews:
   [{
   // For logged-in users (legacy support)
   user: {type: mongoose.Schema.Types.ObjectId,ref: 'User',required: false},
   // For public reviews
   reviewerName: {type: String,required: false},
   reviewerEmail: {type: String,required: false},
   isVerifiedPurchase: {type: Boolean,default: false},
   rating: {type: Number,required: true,min: 1,max: 5},
   comment: String,
   orderId: {type: mongoose.Schema.Types.ObjectId,ref: 'Order',required: false},
   createdAt: {type: Date,default: Date.now}
   }],
  rating: { type: Number, default: 0,set: v => parseFloat(v.toFixed(1)) },
  reviewCount: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  newArrival: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, {
  // Suppress the collection warning since we're using it intentionally
  suppressReservedKeysWarning: true
});

productSchema.pre('save', function(next) {
  if (!this.productCode && this.isNew) {
    const timestamp = Date.now().toString().slice(-6);
    this.productCode = `ECO-${timestamp}`;
  }
  next();
});

productSchema.virtual('displayId').get(function() {
  return this.productCode || this._id.toString();
});

productSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);