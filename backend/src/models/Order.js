const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // Order identification
  orderNo: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  // User who placed the order
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // WeChat openid (needed for unified order creation)
  openid: {
    type: String,
    required: true
  },

  // Product info
  productType: {
    type: String,
    enum: ['full_report', 'premium_subscription', 'master_consult'],
    required: true
  },
  productId: {
    type: String,
    default: ''  // e.g. chart ID or analysis session ID
  },
  productName: {
    type: String,
    required: true
  },

  // Payment amount (in CNY fen, i.e. cents)
  amount: {
    type: Number,
    required: true,
    min: 1
  },

  // Order status
  status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'closed'],
    default: 'pending',
    index: true
  },

  // WeChat Pay transaction details
  wechatPay: {
    prepayId: String,          // Prepay ID returned by unified order API
    transactionId: String,     // WeChat payment transaction ID (from callback)
    timeEnd: String,           // Payment completion time from WeChat
    bankType: String,          // Bank type
    cashFee: Number,           // Actual cash fee paid (in fen)
    feeType: { type: String, default: 'CNY' }
  },

  // Timestamps for payment lifecycle
  paidAt: Date,
  refundedAt: Date,
  closedAt: Date,

  // IP address of the user (required by WeChat Pay API)
  clientIp: {
    type: String,
    default: '127.0.0.1'
  },

  // Additional metadata
  remark: String
}, {
  timestamps: true
});

// Auto-close unpaid orders after 30 minutes
orderSchema.index({ createdAt: 1 }, {
  expireAfterSeconds: 7200,  // TTL: 2 hours for cleanup of stale orders
  partialFilterExpression: { status: 'pending' }
});

// Compound index for querying user orders by status
orderSchema.index({ user: 1, status: 1 });

// Generate a unique order number
orderSchema.statics.generateOrderNo = function() {
  const now = new Date();
  const dateStr = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0') +
    String(now.getHours()).padStart(2, '0') +
    String(now.getMinutes()).padStart(2, '0') +
    String(now.getSeconds()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `BZ${dateStr}${random}`;
};

module.exports = mongoose.model('Order', orderSchema);
