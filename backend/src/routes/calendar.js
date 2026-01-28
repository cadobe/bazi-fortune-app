const express = require('express');
const router = express.Router();

// @route   GET /api/calendar/today
// @desc    Get today's fortune (placeholder)
// @access  Public
router.get('/today', (req, res) => {
  const today = new Date();

  res.json({
    success: true,
    data: {
      date: today.toISOString().split('T')[0],
      lunarDate: '农历十二月初八', // Placeholder
      fortune: {
        overall: '今日运势较佳，适合处理重要事务',
        lucky: {
          color: '红色',
          number: [3, 8],
          direction: '东北'
        },
        avoid: '避免与人争吵，宜心平气和'
      },
      suitable: ['开业', '签约', '出行'],
      unsuitable: ['搬家', '结婚', '动土']
    }
  });
});

module.exports = router;