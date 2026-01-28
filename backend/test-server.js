const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

const app = express();

// Basic middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(compression());
app.use(morgan('combined'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    services: {
      api: 'healthy',
      database: 'not connected',
      redis: 'not connected'
    }
  });
});

// Basic API routes for testing
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'BaZi Fortune API is running!',
    timestamp: new Date().toISOString(),
    features: [
      'BaZi Chart Analysis',
      'AI-Powered Insights',
      'User Authentication',
      'Chart Management',
      'Interactive AI Chat'
    ]
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    availableRoutes: [
      'GET /health',
      'GET /api/test'
    ]
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`🚀 BaZi Fortune API Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = { app, server };