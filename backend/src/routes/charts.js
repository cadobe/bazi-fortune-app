const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { authenticate, optional } = require('../middleware/auth');
const Chart = require('../models/Chart');
const User = require('../models/User');

const router = express.Router();

// @route   POST /api/charts
// @desc    Create new chart
// @access  Private
router.post('/', authenticate, [
  body('name').notEmpty().withMessage('Chart name is required'),
  body('birthInfo').isObject().withMessage('Birth info is required'),
  body('chartData').isObject().withMessage('Chart data is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, description, birthInfo, chartData, tags = [], isPublic = false } = req.body;

    // Create chart
    const chart = new Chart({
      user: req.user._id,
      name,
      description,
      birthInfo,
      chartData,
      tags,
      isPublic
    });

    await chart.save();

    // Update user stats
    req.user.stats.chartsCreated += 1;
    await req.user.save();

    res.status(201).json({
      success: true,
      message: 'Chart created successfully',
      data: { chart }
    });

  } catch (error) {
    console.error('Create chart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating chart'
    });
  }
});

// @route   GET /api/charts
// @desc    Get user's charts
// @access  Private
router.get('/', authenticate, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('search').optional().isString(),
  query('tags').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { page = 1, limit = 10, search, tags, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Build query
    const query = { user: req.user._id };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'birthInfo.name': { $regex: search, $options: 'i' } }
      ];
    }

    if (tags) {
      query.tags = { $in: tags.split(',') };
    }

    // Execute query
    const charts = await Chart.find(query)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-analysisCache'); // Exclude large cached data

    const total = await Chart.countDocuments(query);

    res.json({
      success: true,
      data: {
        charts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get charts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching charts'
    });
  }
});

// @route   GET /api/charts/public
// @desc    Get public charts
// @access  Public
router.get('/public', optional, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 20 }),
  query('search').optional().isString()
], async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    const query = { isPublic: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const charts = await Chart.find(query)
      .populate('user', 'username profile.name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('name description birthInfo.gender chartData.baziString tags createdAt user stats.viewCount');

    const total = await Chart.countDocuments(query);

    res.json({
      success: true,
      data: {
        charts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get public charts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching public charts'
    });
  }
});

// @route   GET /api/charts/:id
// @desc    Get single chart
// @access  Private/Public (depending on chart visibility)
router.get('/:id', optional, async (req, res) => {
  try {
    const chartId = req.params.id;

    // Find chart
    let chart = await Chart.findById(chartId).populate('user', 'username profile.name profile.avatar');

    if (!chart) {
      return res.status(404).json({
        success: false,
        message: 'Chart not found'
      });
    }

    // Check permissions
    if (!chart.isPublic) {
      if (!req.user || chart.user._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    // Update view count
    chart.stats.viewCount += 1;
    chart.stats.lastViewedAt = new Date();
    await chart.save();

    res.json({
      success: true,
      data: { chart }
    });

  } catch (error) {
    console.error('Get chart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching chart'
    });
  }
});

// @route   PUT /api/charts/:id
// @desc    Update chart
// @access  Private (owner only)
router.put('/:id', authenticate, [
  body('name').optional().notEmpty(),
  body('description').optional().isString(),
  body('tags').optional().isArray(),
  body('isPublic').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const chartId = req.params.id;
    const updates = req.body;

    // Find and update chart
    const chart = await Chart.findOneAndUpdate(
      { _id: chartId, user: req.user._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!chart) {
      return res.status(404).json({
        success: false,
        message: 'Chart not found or access denied'
      });
    }

    res.json({
      success: true,
      message: 'Chart updated successfully',
      data: { chart }
    });

  } catch (error) {
    console.error('Update chart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating chart'
    });
  }
});

// @route   DELETE /api/charts/:id
// @desc    Delete chart
// @access  Private (owner only)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const chartId = req.params.id;

    const chart = await Chart.findOneAndDelete({
      _id: chartId,
      user: req.user._id
    });

    if (!chart) {
      return res.status(404).json({
        success: false,
        message: 'Chart not found or access denied'
      });
    }

    res.json({
      success: true,
      message: 'Chart deleted successfully'
    });

  } catch (error) {
    console.error('Delete chart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting chart'
    });
  }
});

// @route   POST /api/charts/:id/share
// @desc    Share chart (increment share count)
// @access  Public
router.post('/:id/share', optional, async (req, res) => {
  try {
    const chartId = req.params.id;

    const chart = await Chart.findById(chartId);

    if (!chart) {
      return res.status(404).json({
        success: false,
        message: 'Chart not found'
      });
    }

    // Only allow sharing of public charts or owned charts
    if (!chart.isPublic && (!req.user || chart.user.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Cannot share private chart'
      });
    }

    chart.stats.shareCount += 1;
    await chart.save();

    res.json({
      success: true,
      message: 'Chart shared successfully',
      data: {
        shareCount: chart.stats.shareCount
      }
    });

  } catch (error) {
    console.error('Share chart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sharing chart'
    });
  }
});

// @route   POST /api/charts/compare
// @desc    Compare two charts
// @access  Private
router.post('/compare', authenticate, [
  body('chart1Id').isMongoId().withMessage('Valid chart1 ID required'),
  body('chart2Id').isMongoId().withMessage('Valid chart2 ID required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { chart1Id, chart2Id } = req.body;

    // Fetch both charts
    const [chart1, chart2] = await Promise.all([
      Chart.findById(chart1Id),
      Chart.findById(chart2Id)
    ]);

    if (!chart1 || !chart2) {
      return res.status(404).json({
        success: false,
        message: 'One or both charts not found'
      });
    }

    // Check permissions
    const canAccessChart1 = chart1.isPublic || chart1.user.toString() === req.user._id.toString();
    const canAccessChart2 = chart2.isPublic || chart2.user.toString() === req.user._id.toString();

    if (!canAccessChart1 || !canAccessChart2) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to one or both charts'
      });
    }

    // Generate comparison analysis
    const comparison = this.generateComparison(chart1, chart2);

    res.json({
      success: true,
      data: {
        chart1: {
          id: chart1._id,
          name: chart1.name,
          baziString: chart1.chartData.baziString,
          gender: chart1.birthInfo.gender
        },
        chart2: {
          id: chart2._id,
          name: chart2.name,
          baziString: chart2.chartData.baziString,
          gender: chart2.birthInfo.gender
        },
        comparison
      }
    });

  } catch (error) {
    console.error('Compare charts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while comparing charts'
    });
  }
});

// @route   GET /api/charts/stats/overview
// @desc    Get charts statistics overview
// @access  Private
router.get('/stats/overview', authenticate, async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Chart.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: null,
          totalCharts: { $sum: 1 },
          publicCharts: {
            $sum: { $cond: ['$isPublic', 1, 0] }
          },
          totalViews: { $sum: '$stats.viewCount' },
          totalShares: { $sum: '$stats.shareCount' },
          avgViews: { $avg: '$stats.viewCount' }
        }
      }
    ]);

    const overview = stats[0] || {
      totalCharts: 0,
      publicCharts: 0,
      totalViews: 0,
      totalShares: 0,
      avgViews: 0
    };

    // Get charts by gender distribution
    const genderStats = await Chart.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$birthInfo.gender',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview,
        genderDistribution: genderStats
      }
    });

  } catch (error) {
    console.error('Get chart stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching chart statistics'
    });
  }
});

// Helper method for chart comparison
function generateComparison(chart1, chart2) {
  const compatibility = Math.floor(Math.random() * 40) + 60; // 60-100%

  return {
    compatibility: {
      score: compatibility,
      level: compatibility >= 80 ? 'excellent' : compatibility >= 70 ? 'good' : 'average'
    },
    elementalHarmony: {
      score: Math.floor(Math.random() * 30) + 70,
      description: '两人五行搭配较为和谐，能够互补不足。'
    },
    personalityMatch: {
      score: Math.floor(Math.random() * 35) + 65,
      description: '性格方面有一定的互补性，需要相互理解包容。'
    },
    suggestions: [
      '建议多沟通交流，增进相互了解',
      '在重要决策时可以互相商量',
      '保持各自的独立性和个人空间'
    ]
  };
}

module.exports = router;