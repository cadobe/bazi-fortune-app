const mongoose = require('mongoose');

const analysisSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  chart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chart',
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },

  // Chat messages
  messages: [{
    id: String,
    type: {
      type: String,
      enum: ['user', 'ai', 'system'],
      required: true
    },
    content: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: {
      tokens: Number,
      model: String,
      confidence: Number
    }
  }],

  // Analysis context
  context: {
    analysisType: String,
    focusAreas: [String],
    userQuestions: [String]
  },

  // Session stats
  stats: {
    messageCount: { type: Number, default: 0 },
    tokensUsed: { type: Number, default: 0 },
    startTime: { type: Date, default: Date.now },
    lastActivity: { type: Date, default: Date.now }
  },

  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// TTL index to auto-delete old sessions after 30 days
analysisSessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

module.exports = mongoose.model('AnalysisSession', analysisSessionSchema);