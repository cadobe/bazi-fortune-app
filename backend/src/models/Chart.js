const mongoose = require('mongoose');

const chartSchema = new mongoose.Schema({
  // Owner information
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Chart metadata
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [String],

  // Birth information
  birthInfo: {
    name: String,
    gender: {
      type: String,
      enum: ['male', 'female'],
      required: true
    },
    birthDate: {
      year: { type: Number, required: true },
      month: { type: Number, required: true },
      day: { type: Number, required: true },
      hour: { type: Number, required: true },
      minute: { type: Number, default: 0 }
    },
    calendarType: {
      type: String,
      enum: ['solar', 'lunar'],
      default: 'solar'
    },
    location: {
      region: String,
      longitude: { type: Number, default: 116.4 },
      latitude: { type: Number, default: 39.9 },
      timezone: String
    },
    useTrueSolarTime: {
      type: Boolean,
      default: false
    }
  },

  // Chart calculation results
  chartData: {
    // Four pillars
    pillars: [{
      tiangan: String,
      dizhi: String,
      wuxing: String,
      nayin: String
    }],

    // Additional calculations
    dayTiangan: String,
    baziString: String,

    // Five elements analysis
    wuxingStats: [{
      name: String,
      element: String,
      count: Number,
      strength: String
    }],

    // Ten Gods analysis
    shishen: [{
      name: String,
      position: String,
      element: String
    }],

    // Nayin for each pillar
    nayin: [{
      pillar: String,
      value: String
    }]
  },

  // AI Analysis results (cached)
  analysisCache: {
    personality: String,
    career: String,
    careerTags: [String],
    wealth: String,
    wealthScore: Number,
    relationship: String,
    loveScore: Number,
    health: String,
    healthTips: [String],
    luckPeriods: [{
      age: Number,
      description: String,
      type: String
    }],
    suggestions: [{
      category: String,
      items: [String]
    }],
    confidence: Number,
    lastAnalyzedAt: Date
  },

  // Usage statistics
  stats: {
    viewCount: { type: Number, default: 0 },
    shareCount: { type: Number, default: 0 },
    analysisCount: { type: Number, default: 0 },
    lastViewedAt: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
chartSchema.index({ user: 1, createdAt: -1 });
chartSchema.index({ isPublic: 1, createdAt: -1 });
chartSchema.index({ 'birthInfo.birthDate.year': 1 });
chartSchema.index({ tags: 1 });

// Virtual for chart age
chartSchema.virtual('age').get(function() {
  const currentYear = new Date().getFullYear();
  return currentYear - this.birthInfo.birthDate.year;
});

module.exports = mongoose.model('Chart', chartSchema);