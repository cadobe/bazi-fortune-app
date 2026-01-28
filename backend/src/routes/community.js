const express = require('express');
const router = express.Router();

// @route   GET /api/community/posts
// @desc    Get community posts (placeholder)
// @access  Public
router.get('/posts', (req, res) => {
  res.json({
    success: true,
    message: 'Community feature coming soon',
    data: {
      posts: [],
      pagination: { page: 1, limit: 10, total: 0, pages: 0 }
    }
  });
});

module.exports = router;