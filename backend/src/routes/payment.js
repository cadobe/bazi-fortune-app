const express = require('express');
const crypto = require('crypto');
const axios = require('axios');
const { body, param, validationResult } = require('express-validator');
const Order = require('../models/Order');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// -------------------------------------------------------------------
// WeChat Pay configuration helpers
// -------------------------------------------------------------------

const getWechatPayConfig = () => ({
  appId: process.env.WECHAT_APP_ID || process.env.WECHAT_APPID,
  mchId: process.env.WECHAT_MCH_ID,
  payKey: process.env.WECHAT_PAY_KEY,
  notifyUrl: process.env.WECHAT_PAY_NOTIFY_URL ||
    `${process.env.FRONTEND_URL || 'https://bazi-fortune-app.onrender.com'}/api/payment/notify`
});

/**
 * Generate WeChat Pay sign (MD5 signature).
 * Follows WeChat specification: sort keys alphabetically, concatenate as
 * key=value&key=value...&key=<pay_key>, then MD5 and uppercase.
 */
const generateSign = (params, payKey) => {
  const sortedKeys = Object.keys(params).filter(k => params[k] !== '' && params[k] !== undefined && params[k] !== null).sort();
  const stringA = sortedKeys.map(k => `${k}=${params[k]}`).join('&');
  const stringSignTemp = `${stringA}&key=${payKey}`;
  return crypto.createHash('md5').update(stringSignTemp, 'utf8').digest('hex').toUpperCase();
};

/**
 * Convert a plain object to XML string (for WeChat Pay API).
 */
const objectToXml = (obj) => {
  let xml = '<xml>';
  for (const [key, value] of Object.entries(obj)) {
    xml += `<${key}><![CDATA[${value}]]></${key}>`;
  }
  xml += '</xml>';
  return xml;
};

/**
 * Parse XML string into a plain object. Uses a simple regex-based parser
 * to avoid adding an XML dependency. WeChat Pay responses are flat XML
 * with no nested elements, so this is safe.
 */
const parseXml = (xml) => {
  const result = {};
  const regex = /<(\w+)><!\[CDATA\[(.*?)\]\]><\/\1>|<(\w+)>(.*?)<\/\3>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    const key = match[1] || match[3];
    const value = match[2] !== undefined ? match[2] : match[4];
    result[key] = value;
  }
  return result;
};

/**
 * Generate a random nonce string of given length.
 */
const generateNonceStr = (length = 32) => {
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
};

// -------------------------------------------------------------------
// Product definitions
// -------------------------------------------------------------------

const PRODUCTS = {
  full_report: {
    name: 'AI Complete Fortune Report',
    displayName: 'AI完整命理分析报告',
    amount: 990  // 9.90 CNY in fen
  }
};

// -------------------------------------------------------------------
// Routes
// -------------------------------------------------------------------

// @route   POST /api/payment/create-order
// @desc    Create a WeChat Pay unified order for report unlock
// @access  Private (requires JWT)
router.post('/create-order', authenticate, [
  body('productType').isIn(Object.keys(PRODUCTS)).withMessage('Invalid product type'),
  body('productId').optional().isString()
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

    const { productType, productId } = req.body;
    const user = req.user;
    const config = getWechatPayConfig();

    // Validate WeChat Pay configuration
    if (!config.appId || !config.mchId || !config.payKey) {
      logger.error('[Payment] WeChat Pay not configured', {
        hasAppId: !!config.appId,
        hasMchId: !!config.mchId,
        hasPayKey: !!config.payKey
      });
      return res.status(503).json({
        success: false,
        message: 'Payment service is not configured yet'
      });
    }

    // Ensure user has a WeChat openid
    const openid = user.wechat?.openid;
    if (!openid) {
      return res.status(400).json({
        success: false,
        message: 'WeChat openid not found. Please login via WeChat first.'
      });
    }

    // Check if user already paid for this specific report
    if (productId) {
      const existingPaid = user.paidReports?.find(
        r => r.productType === productType && r.productId === productId
      );
      if (existingPaid) {
        return res.status(409).json({
          success: false,
          message: 'You have already unlocked this report'
        });
      }
    }

    // Check for an existing pending order for the same product (avoid duplicate orders)
    const existingOrder = await Order.findOne({
      user: user._id,
      productType,
      productId: productId || '',
      status: 'pending',
      createdAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) }  // within 30 min
    });

    if (existingOrder) {
      logger.info('[Payment] Returning existing pending order', { orderNo: existingOrder.orderNo });
      // Re-use the existing prepay info instead of creating a new unified order
      // The frontend can call wx.requestPayment with these params again
    }

    const product = PRODUCTS[productType];
    const orderNo = Order.generateOrderNo();
    const nonceStr = generateNonceStr();
    const clientIp = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';

    // Create order record in database first
    const order = new Order({
      orderNo,
      user: user._id,
      openid,
      productType,
      productId: productId || '',
      productName: product.displayName,
      amount: product.amount,
      clientIp
    });
    await order.save();

    logger.info('[Payment] Order created', {
      orderNo,
      userId: user._id,
      productType,
      amount: product.amount
    });

    // Build WeChat Pay unified order request parameters
    const unifiedOrderParams = {
      appid: config.appId,
      mch_id: config.mchId,
      nonce_str: nonceStr,
      body: product.displayName,
      out_trade_no: orderNo,
      total_fee: product.amount,
      spbill_create_ip: clientIp.replace('::ffff:', ''),  // Strip IPv6 prefix
      notify_url: config.notifyUrl,
      trade_type: 'JSAPI',
      openid
    };

    // Sign the request
    unifiedOrderParams.sign = generateSign(unifiedOrderParams, config.payKey);

    // Call WeChat Pay unified order API
    const xmlBody = objectToXml(unifiedOrderParams);

    logger.info('[Payment] Calling WeChat unified order API', { orderNo });

    const wxResponse = await axios.post(
      'https://api.mch.weixin.qq.com/pay/unifiedorder',
      xmlBody,
      {
        headers: { 'Content-Type': 'text/xml' },
        timeout: 10000
      }
    );

    const wxResult = parseXml(wxResponse.data);

    if (wxResult.return_code !== 'SUCCESS') {
      logger.error('[Payment] Unified order failed (return_code)', {
        orderNo,
        return_msg: wxResult.return_msg
      });
      order.status = 'failed';
      order.remark = wxResult.return_msg;
      await order.save();

      return res.status(502).json({
        success: false,
        message: `Payment service error: ${wxResult.return_msg}`
      });
    }

    if (wxResult.result_code !== 'SUCCESS') {
      logger.error('[Payment] Unified order failed (result_code)', {
        orderNo,
        err_code: wxResult.err_code,
        err_code_des: wxResult.err_code_des
      });
      order.status = 'failed';
      order.remark = `${wxResult.err_code}: ${wxResult.err_code_des}`;
      await order.save();

      return res.status(502).json({
        success: false,
        message: `Payment creation failed: ${wxResult.err_code_des}`
      });
    }

    // Store prepay_id
    const prepayId = wxResult.prepay_id;
    order.wechatPay.prepayId = prepayId;
    await order.save();

    // Build payment parameters for frontend wx.requestPayment()
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const payParams = {
      appId: config.appId,
      timeStamp: timestamp,
      nonceStr: generateNonceStr(),
      package: `prepay_id=${prepayId}`,
      signType: 'MD5'
    };
    payParams.paySign = generateSign(payParams, config.payKey);

    logger.info('[Payment] Unified order successful, returning payment params', { orderNo });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        orderNo,
        orderId: order._id,
        amount: product.amount,
        displayAmount: (product.amount / 100).toFixed(2),
        payParams: {
          timeStamp: payParams.timeStamp,
          nonceStr: payParams.nonceStr,
          package: payParams.package,
          signType: payParams.signType,
          paySign: payParams.paySign
        }
      }
    });
  } catch (error) {
    logger.error('[Payment] Create order error', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: 'Server error during order creation'
    });
  }
});

// @route   POST /api/payment/notify
// @desc    WeChat Pay asynchronous payment callback
// @access  Public (called by WeChat servers)
router.post('/notify', express.text({ type: 'text/xml' }), async (req, res) => {
  // WeChat expects XML responses
  const successXml = '<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>';
  const failXml = (msg) => `<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[${msg}]]></return_msg></xml>`;

  try {
    const config = getWechatPayConfig();

    // Parse the callback XML body
    const rawBody = typeof req.body === 'string' ? req.body : req.body.toString();
    const notifyData = parseXml(rawBody);

    logger.info('[Payment Notify] Received callback', {
      return_code: notifyData.return_code,
      out_trade_no: notifyData.out_trade_no
    });

    if (notifyData.return_code !== 'SUCCESS') {
      logger.warn('[Payment Notify] return_code is not SUCCESS', notifyData);
      res.type('text/xml').send(failXml('return_code is not SUCCESS'));
      return;
    }

    // Verify the signature to ensure the callback is from WeChat
    const receivedSign = notifyData.sign;
    const verifyParams = { ...notifyData };
    delete verifyParams.sign;

    const expectedSign = generateSign(verifyParams, config.payKey);
    if (receivedSign !== expectedSign) {
      logger.error('[Payment Notify] Signature verification failed', {
        out_trade_no: notifyData.out_trade_no,
        receivedSign,
        expectedSign
      });
      res.type('text/xml').send(failXml('Signature verification failed'));
      return;
    }

    // Find the order
    const orderNo = notifyData.out_trade_no;
    const order = await Order.findOne({ orderNo });

    if (!order) {
      logger.error('[Payment Notify] Order not found', { orderNo });
      res.type('text/xml').send(failXml('Order not found'));
      return;
    }

    // Idempotency: if order is already paid, just return success
    if (order.status === 'paid') {
      logger.info('[Payment Notify] Order already paid, returning success', { orderNo });
      res.type('text/xml').send(successXml);
      return;
    }

    // Verify the payment amount matches
    const paidAmount = parseInt(notifyData.total_fee, 10);
    if (paidAmount !== order.amount) {
      logger.error('[Payment Notify] Amount mismatch', {
        orderNo,
        expected: order.amount,
        received: paidAmount
      });
      res.type('text/xml').send(failXml('Amount mismatch'));
      return;
    }

    if (notifyData.result_code === 'SUCCESS') {
      // Payment successful -- update order
      order.status = 'paid';
      order.paidAt = new Date();
      order.wechatPay.transactionId = notifyData.transaction_id;
      order.wechatPay.timeEnd = notifyData.time_end;
      order.wechatPay.bankType = notifyData.bank_type;
      order.wechatPay.cashFee = parseInt(notifyData.cash_fee, 10) || paidAmount;
      await order.save();

      // Update user's paid reports
      await User.findByIdAndUpdate(order.user, {
        $push: {
          paidReports: {
            orderId: order._id,
            productType: order.productType,
            productId: order.productId,
            paidAt: order.paidAt
          }
        }
      });

      logger.info('[Payment Notify] Payment confirmed', {
        orderNo,
        transactionId: notifyData.transaction_id,
        amount: paidAmount
      });
    } else {
      // Payment failed
      order.status = 'failed';
      order.remark = `${notifyData.err_code}: ${notifyData.err_code_des}`;
      await order.save();

      logger.warn('[Payment Notify] Payment failed', {
        orderNo,
        err_code: notifyData.err_code,
        err_code_des: notifyData.err_code_des
      });
    }

    res.type('text/xml').send(successXml);
  } catch (error) {
    logger.error('[Payment Notify] Processing error', {
      message: error.message,
      stack: error.stack
    });
    // Still return success to avoid WeChat retrying endlessly, but log the error
    res.type('text/xml').send(failXml('Internal error'));
  }
});

// @route   GET /api/payment/status/:orderId
// @desc    Check payment status of an order
// @access  Private (requires JWT)
router.get('/status/:orderId', authenticate, [
  param('orderId').notEmpty().withMessage('Order ID is required')
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

    const { orderId } = req.params;

    // Support both MongoDB _id and orderNo lookups
    const query = orderId.length === 24
      ? { _id: orderId, user: req.user._id }
      : { orderNo: orderId, user: req.user._id };

    const order = await Order.findOne(query);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // If order is still pending, optionally query WeChat for the latest status
    if (order.status === 'pending') {
      const config = getWechatPayConfig();

      if (config.appId && config.mchId && config.payKey) {
        try {
          const queryResult = await queryWechatOrderStatus(order.orderNo, config);
          if (queryResult && queryResult.trade_state === 'SUCCESS') {
            // Update order as paid
            order.status = 'paid';
            order.paidAt = new Date();
            order.wechatPay.transactionId = queryResult.transaction_id;
            order.wechatPay.timeEnd = queryResult.time_end;
            await order.save();

            // Update user's paid reports
            await User.findByIdAndUpdate(order.user, {
              $push: {
                paidReports: {
                  orderId: order._id,
                  productType: order.productType,
                  productId: order.productId,
                  paidAt: order.paidAt
                }
              }
            });

            logger.info('[Payment] Order status updated via query', {
              orderNo: order.orderNo,
              transactionId: queryResult.transaction_id
            });
          } else if (queryResult && queryResult.trade_state === 'CLOSED') {
            order.status = 'closed';
            order.closedAt = new Date();
            await order.save();
          }
        } catch (queryError) {
          // Non-fatal -- we can still return the current DB status
          logger.warn('[Payment] Failed to query WeChat order status', {
            orderNo: order.orderNo,
            error: queryError.message
          });
        }
      }
    }

    res.json({
      success: true,
      data: {
        orderNo: order.orderNo,
        orderId: order._id,
        status: order.status,
        amount: order.amount,
        displayAmount: (order.amount / 100).toFixed(2),
        productType: order.productType,
        productId: order.productId,
        productName: order.productName,
        paidAt: order.paidAt,
        createdAt: order.createdAt
      }
    });
  } catch (error) {
    logger.error('[Payment] Status check error', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: 'Server error during payment status check'
    });
  }
});

// @route   GET /api/payment/user-purchases
// @desc    Get all paid reports for the current user
// @access  Private (requires JWT)
router.get('/user-purchases', authenticate, async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
      status: 'paid'
    }).sort({ paidAt: -1 }).select('orderNo productType productId productName amount paidAt');

    res.json({
      success: true,
      data: {
        purchases: orders.map(o => ({
          orderNo: o.orderNo,
          productType: o.productType,
          productId: o.productId,
          productName: o.productName,
          displayAmount: (o.amount / 100).toFixed(2),
          paidAt: o.paidAt
        }))
      }
    });
  } catch (error) {
    logger.error('[Payment] User purchases query error', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// -------------------------------------------------------------------
// Helper: query order status directly from WeChat Pay
// -------------------------------------------------------------------

async function queryWechatOrderStatus(orderNo, config) {
  const nonceStr = generateNonceStr();
  const queryParams = {
    appid: config.appId,
    mch_id: config.mchId,
    out_trade_no: orderNo,
    nonce_str: nonceStr
  };
  queryParams.sign = generateSign(queryParams, config.payKey);

  const xmlBody = objectToXml(queryParams);
  const wxResponse = await axios.post(
    'https://api.mch.weixin.qq.com/pay/orderquery',
    xmlBody,
    {
      headers: { 'Content-Type': 'text/xml' },
      timeout: 10000
    }
  );

  const result = parseXml(wxResponse.data);

  if (result.return_code === 'SUCCESS' && result.result_code === 'SUCCESS') {
    return result;
  }

  return null;
}

module.exports = router;
