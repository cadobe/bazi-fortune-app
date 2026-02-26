const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', [
  body('username').isLength({ min: 3, max: 20 }).withMessage('Username must be 3-20 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
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

    const { username, email, password, profile } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or username'
      });
    }

    // Create user
    const user = new User({
      username,
      email,
      password,
      profile: profile || {}
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    logger.error('[Auth] Registration error', { message: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
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

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email }).select('+password');

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last active time
    user.stats.lastActiveAt = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Remove password from response
    user.password = undefined;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    logger.error('[Auth] Login error', { message: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   POST /api/auth/wechat-login
// @desc    WeChat mini-program login
// @access  Public
router.post('/wechat-login', [
  body('code').notEmpty().withMessage('WeChat code is required')
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

    const { code, userInfo } = req.body;

    // Exchange code for openid and session_key via WeChat API
    let openid, sessionKey, unionid;

    const appId = process.env.WECHAT_APP_ID || process.env.WECHAT_APPID;
    const appSecret = process.env.WECHAT_APP_SECRET;

    if (appId && appSecret) {
      logger.info('[WeChat Login] Exchanging code with WeChat API');

      const wxRes = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
        params: {
          appid: appId,
          secret: appSecret,
          js_code: code,
          grant_type: 'authorization_code'
        },
        timeout: 5000
      });

      if (wxRes.data.errcode) {
        logger.error('[WeChat Login] WeChat API error', {
          errcode: wxRes.data.errcode,
          errmsg: wxRes.data.errmsg
        });
        return res.status(400).json({
          success: false,
          message: `WeChat login failed: ${wxRes.data.errmsg}`
        });
      }

      openid = wxRes.data.openid;
      sessionKey = wxRes.data.session_key;
      unionid = wxRes.data.unionid;  // May be undefined if not bound to open platform

      logger.info('[WeChat Login] Code exchanged successfully', { openid });
    } else {
      // Development fallback: derive a stable openid from the code
      logger.warn('[WeChat Login] No WECHAT_APP_ID/WECHAT_APP_SECRET configured, using dev fallback');
      openid = `dev_openid_${Buffer.from(code).toString('base64').slice(0, 16)}`;
      sessionKey = 'dev_session_key';
    }

    // Find existing user or create new one
    let user = await User.findOne({ 'wechat.openid': openid });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      logger.info('[WeChat Login] Creating new user', { openid });

      user = new User({
        username: `wx_${openid.slice(-8)}_${Date.now().toString(36)}`,
        email: `${openid}@wechat.placeholder`,
        password: require('crypto').randomBytes(32).toString('hex'),  // Random password for WeChat users
        wechat: {
          openid,
          unionid: unionid || undefined,
          sessionKey,
          nickname: userInfo?.nickName || 'WeChat User',
          avatarUrl: userInfo?.avatarUrl || ''
        },
        profile: {
          name: userInfo?.nickName || '',
          avatar: userInfo?.avatarUrl || '',
          gender: userInfo?.gender === 1 ? 'male' : userInfo?.gender === 2 ? 'female' : 'male'
        },
        isVerified: true
      });

      await user.save();
    } else {
      // Update session_key and user info on every login
      user.wechat.sessionKey = sessionKey;
      if (unionid) {
        user.wechat.unionid = unionid;
      }
      if (userInfo) {
        if (userInfo.nickName) user.wechat.nickname = userInfo.nickName;
        if (userInfo.avatarUrl) user.wechat.avatarUrl = userInfo.avatarUrl;
      }
      user.stats.lastActiveAt = new Date();
      await user.save();

      logger.info('[WeChat Login] Existing user logged in', { openid, userId: user._id });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: isNewUser ? 'WeChat registration successful' : 'WeChat login successful',
      data: {
        user,
        token,
        isNewUser
      }
    });
  } catch (error) {
    logger.error('[WeChat Login] Error during WeChat login', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: 'Server error during WeChat login'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authenticate, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    logger.error('[Auth] Get user error', { message: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/auth/refresh
// @desc    Refresh JWT token
// @access  Private
router.post('/refresh', authenticate, async (req, res) => {
  try {
    const token = generateToken(req.user._id);

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token
      }
    });
  } catch (error) {
    logger.error('[Auth] Token refresh error', { message: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      message: 'Server error during token refresh'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authenticate, async (req, res) => {
  try {
    // In a real implementation, you might want to blacklist the token
    // For now, we'll just return success
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    logger.error('[Auth] Logout error', { message: error.message, stack: error.stack });
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
});

module.exports = router;