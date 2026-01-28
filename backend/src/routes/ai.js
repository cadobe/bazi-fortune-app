const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticate, optional } = require('../middleware/auth');
const Chart = require('../models/Chart');
const AnalysisSession = require('../models/AnalysisSession');
const aiService = require('../services/aiService');

const router = express.Router();

// @route   POST /api/ai/analyze
// @desc    Generate AI analysis for a chart
// @access  Private
router.post('/analyze', authenticate, [
  body('chartData').notEmpty().withMessage('Chart data is required'),
  body('analysisType').optional().isIn(['comprehensive', 'career', 'relationship', 'health', 'wealth']).withMessage('Invalid analysis type')
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

    const { chartData, analysisType = 'comprehensive', focusAreas = [] } = req.body;

    // Check user's analysis quota
    const userAnalysisCount = await AnalysisSession.countDocuments({
      user: req.user._id,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    });

    const maxAnalysisPerDay = req.user.subscription.type === 'free' ? 3 :
                              req.user.subscription.type === 'premium' ? 20 : 100;

    if (userAnalysisCount >= maxAnalysisPerDay) {
      return res.status(429).json({
        success: false,
        message: `Daily analysis limit reached. You can perform ${maxAnalysisPerDay} analyses per day.`
      });
    }

    // Generate analysis using AI service
    const analysisResult = await aiService.generateAnalysis(chartData, {
      analysisType,
      focusAreas,
      userPreferences: req.user.settings
    });

    // Update user stats
    req.user.stats.analysisRequests += 1;
    await req.user.save();

    res.json({
      success: true,
      message: 'Analysis generated successfully',
      data: analysisResult
    });

  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during analysis'
    });
  }
});

// @route   POST /api/ai/chat
// @desc    AI chat for chart analysis
// @access  Private
router.post('/chat', authenticate, [
  body('message').notEmpty().withMessage('Message is required'),
  body('chartData').notEmpty().withMessage('Chart data is required'),
  body('sessionId').optional().isString()
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

    const { message, chartData, sessionId } = req.body;

    // Find or create analysis session
    let session = sessionId ? await AnalysisSession.findOne({
      sessionId,
      user: req.user._id,
      isActive: true
    }) : null;

    if (!session) {
      // Create new session
      session = new AnalysisSession({
        user: req.user._id,
        chart: chartData.chartId,
        sessionId: sessionId || `session_${Date.now()}_${req.user._id}`,
        context: {
          analysisType: 'chat',
          focusAreas: []
        }
      });
    }

    // Add user message
    const userMessage = {
      id: `msg_${Date.now()}`,
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    session.messages.push(userMessage);

    // Generate AI response
    const aiResponse = await aiService.generateChatResponse(message, chartData, {
      sessionHistory: session.messages,
      userPreferences: req.user.settings
    });

    // Add AI message
    const aiMessage = {
      id: `msg_${Date.now() + 1}`,
      type: 'ai',
      content: aiResponse.content,
      timestamp: new Date(),
      metadata: {
        tokens: aiResponse.tokens,
        model: aiResponse.model,
        confidence: aiResponse.confidence
      }
    };

    session.messages.push(aiMessage);
    session.stats.messageCount += 2;
    session.stats.tokensUsed += aiResponse.tokens || 0;
    session.stats.lastActivity = new Date();

    await session.save();

    res.json({
      success: true,
      message: 'Chat response generated',
      data: {
        response: aiResponse.content,
        sessionId: session.sessionId,
        messageId: aiMessage.id,
        metadata: aiMessage.metadata
      }
    });

  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during chat'
    });
  }
});

// @route   GET /api/ai/sessions
// @desc    Get user's analysis sessions
// @access  Private
router.get('/sessions', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const sessions = await AnalysisSession.find({
      user: req.user._id,
      isActive: true
    })
    .populate('chart', 'name birthInfo.name')
    .sort({ 'stats.lastActivity': -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .select('sessionId context stats createdAt chart');

    const total = await AnalysisSession.countDocuments({
      user: req.user._id,
      isActive: true
    });

    res.json({
      success: true,
      data: {
        sessions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching sessions'
    });
  }
});

// @route   GET /api/ai/sessions/:sessionId
// @desc    Get specific analysis session
// @access  Private
router.get('/sessions/:sessionId', authenticate, async (req, res) => {
  try {
    const session = await AnalysisSession.findOne({
      sessionId: req.params.sessionId,
      user: req.user._id
    }).populate('chart');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    res.json({
      success: true,
      data: { session }
    });

  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching session'
    });
  }
});

// @route   DELETE /api/ai/sessions/:sessionId
// @desc    Delete analysis session
// @access  Private
router.delete('/sessions/:sessionId', authenticate, async (req, res) => {
  try {
    const session = await AnalysisSession.findOneAndUpdate(
      {
        sessionId: req.params.sessionId,
        user: req.user._id
      },
      { isActive: false },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    res.json({
      success: true,
      message: 'Session deleted successfully'
    });

  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting session'
    });
  }
});

// @route   GET /api/ai/usage
// @desc    Get user's AI usage stats
// @access  Private
router.get('/usage', authenticate, async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    // Today's usage
    const todayUsage = await AnalysisSession.aggregate([
      {
        $match: {
          user: req.user._id,
          createdAt: { $gte: startOfDay }
        }
      },
      {
        $group: {
          _id: null,
          sessions: { $sum: 1 },
          totalMessages: { $sum: '$stats.messageCount' },
          totalTokens: { $sum: '$stats.tokensUsed' }
        }
      }
    ]);

    // This month's usage
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthUsage = await AnalysisSession.aggregate([
      {
        $match: {
          user: req.user._id,
          createdAt: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          sessions: { $sum: 1 },
          totalMessages: { $sum: '$stats.messageCount' },
          totalTokens: { $sum: '$stats.tokensUsed' }
        }
      }
    ]);

    const maxAnalysisPerDay = req.user.subscription.type === 'free' ? 3 :
                              req.user.subscription.type === 'premium' ? 20 : 100;

    res.json({
      success: true,
      data: {
        today: todayUsage[0] || { sessions: 0, totalMessages: 0, totalTokens: 0 },
        thisMonth: monthUsage[0] || { sessions: 0, totalMessages: 0, totalTokens: 0 },
        limits: {
          maxAnalysisPerDay,
          subscriptionType: req.user.subscription.type
        }
      }
    });

  } catch (error) {
    console.error('Get usage error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching usage stats'
    });
  }
});

module.exports = router;