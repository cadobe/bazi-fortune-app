const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic info
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },

  // Profile info
  profile: {
    name: String,
    avatar: String,
    gender: {
      type: String,
      enum: ['male', 'female'],
      default: 'male'
    },
    birthDate: Date,
    location: String,
    bio: String
  },

  // WeChat integration
  wechat: {
    openid: { type: String, index: true, sparse: true },
    unionid: String,
    sessionKey: String,  // WeChat session_key (encrypted, for decrypting user data)
    nickname: String,
    avatarUrl: String
  },

  // App settings
  settings: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    language: {
      type: String,
      enum: ['zh-CN', 'zh-TW', 'en'],
      default: 'zh-CN'
    },
    notifications: {
      push: { type: Boolean, default: true },
      email: { type: Boolean, default: false },
      fortune: { type: Boolean, default: true }
    },
    privacy: {
      showBirthInfo: { type: Boolean, default: false },
      allowFriendSearch: { type: Boolean, default: true }
    }
  },

  // Subscription info
  subscription: {
    type: {
      type: String,
      enum: ['free', 'premium', 'vip'],
      default: 'free'
    },
    expiresAt: Date,
    features: [String]
  },

  // Paid report unlocks (stores chart/analysis IDs the user has paid for)
  paidReports: [{
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    productType: String,
    productId: String,
    paidAt: { type: Date, default: Date.now }
  }],

  // Usage stats
  stats: {
    chartsCreated: { type: Number, default: 0 },
    analysisRequests: { type: Number, default: 0 },
    lastActiveAt: Date,
    joinedAt: { type: Date, default: Date.now }
  },

  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['user', 'master', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  if (user.wechat) {
    delete user.wechat.sessionKey;
  }
  return user;
};

module.exports = mongoose.model('User', userSchema);