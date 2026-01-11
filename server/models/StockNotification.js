const mongoose = require('mongoose');

const stockNotificationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
  },
  phone: {
    type: String,
    required: false,
    trim: true,
    match: [/^[0-9]{10}$/, 'Please add a valid 10-digit phone number']
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  notified: {
    type: Boolean,
    default: false
  },
  notificationChannels: {
    email: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: false
    },
    whatsapp: {
      type: Boolean,
      default: false
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  notifiedAt: {
    type: Date
  }
});

stockNotificationSchema.index({ product: 1, email: 1 }, { unique: true });
stockNotificationSchema.index({ product: 1, phone: 1 });

module.exports = mongoose.model('StockNotification', stockNotificationSchema);
