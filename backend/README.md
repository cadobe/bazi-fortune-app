# BaZi Fortune App - Backend API

A professional backend service for the BaZi Fortune App, providing comprehensive Chinese astrology services with AI-powered analysis.

## 🌟 Features

- **Complete BaZi Chart Analysis** - Four pillars calculation with traditional algorithms
- **AI-Powered Insights** - OpenAI integration for intelligent fortune analysis
- **User Management** - JWT authentication with WeChat mini-program support
- **Chart Management** - Create, save, and share BaZi charts
- **Interactive AI Chat** - Real-time Q&A about chart interpretations
- **Professional API** - RESTful endpoints with comprehensive validation
- **High Performance** - Redis caching and MongoDB optimization
- **Production Ready** - Docker containerization and security features

## 🏗️ Architecture

```
├── src/
│   ├── controllers/     # Request handlers
│   ├── models/         # MongoDB schemas
│   ├── routes/         # API route definitions
│   ├── middleware/     # Authentication, validation, etc.
│   ├── services/       # Business logic (AI, cache, etc.)
│   └── utils/          # Helper functions and utilities
├── config/             # Configuration files
├── logs/              # Application logs
├── uploads/           # File storage
└── tests/             # Test suites
```

## 🚀 Quick Deploy to Cloud

### ⚡ One-Click Deployments

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/your-template)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/yourusername/bazi-fortune-app)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/bazi-fortune-app/tree/main/backend)

### 🎯 Choose Your Platform

```bash
# Interactive platform selector
./cloud-deploy.sh

# Direct deployment to specific platform
./deploy-railway.sh    # Recommended: Fastest setup
./deploy-render.sh     # Great alternative
./deploy-vercel.sh     # Serverless option
```

### 📋 Platform Comparison

| Platform | Setup Time | Cost/Month | Databases | Best For |
|----------|------------|------------|-----------|----------|
| **Railway** ⭐⭐⭐⭐⭐ | 5 min | $5 | ✅ Included | Beginners, rapid prototyping |
| **Render** ⭐⭐⭐⭐ | 10 min | $7+ | ✅ Available | Production apps |
| **Vercel** ⭐⭐⭐ | 15 min | Free+DB | ❌ External | Global, serverless |
| **DigitalOcean** ⭐⭐⭐ | 20 min | $42+ | ✅ Managed | Full control, scaling |

**💡 Recommendation**: Start with Railway for the fastest deployment experience!

---

## 🏠 Local Development

### Prerequisites

- Node.js >= 16.0.0
- MongoDB >= 6.0
- Redis >= 7.0
- Docker & Docker Compose (recommended)

### Option 1: Docker Deployment (Recommended)

1. **Clone and setup**
   ```bash
   cd bazi-fortune-app/backend
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. **Deploy with Docker**
   ```bash
   ./deploy.sh
   ```

3. **Verify deployment**
   ```bash
   curl http://localhost:3000/health
   ```

### Option 2: Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Setup environment**
   ```bash
   cp .env.example .env
   # Configure your .env file
   ```

3. **Start services**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `development` |
| `PORT` | Server port | `3000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/bazi-fortune` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `JWT_SECRET` | JWT signing secret | Required |
| `OPENAI_API_KEY` | OpenAI API key | Optional |
| `OPENAI_MODEL` | OpenAI model | `gpt-4` |

### MongoDB Setup

The app automatically creates required indexes and collections. For manual setup:

```javascript
// Initialize database
use bazi-fortune;

// Create indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.charts.createIndex({ "user": 1, "createdAt": -1 });
db.analysissessions.createIndex({ "createdAt": 1 }, { expireAfterSeconds: 2592000 });
```

## 📚 API Documentation

### Authentication

```bash
# Register new user
POST /api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}

# Login
POST /api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}

# WeChat login
POST /api/auth/wechat-login
Content-Type: application/json

{
  "code": "wechat_code",
  "userInfo": {
    "nickName": "User Name",
    "avatarUrl": "avatar_url"
  }
}
```

### Chart Management

```bash
# Create chart
POST /api/charts
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Chart",
  "birthInfo": {
    "name": "张三",
    "gender": "male",
    "birthDate": {
      "year": 1990,
      "month": 6,
      "day": 15,
      "hour": 14,
      "minute": 30
    }
  },
  "chartData": {
    "pillars": [...],
    "baziString": "庚午 壬午 甲寅 辛未"
  }
}

# Get user charts
GET /api/charts?page=1&limit=10
Authorization: Bearer <token>

# Get single chart
GET /api/charts/:id
Authorization: Bearer <token>
```

### AI Analysis

```bash
# Generate analysis
POST /api/ai/analyze
Authorization: Bearer <token>
Content-Type: application/json

{
  "chartData": {
    "pillars": [...],
    "dayTiangan": "甲",
    "wuxingStats": [...]
  },
  "analysisType": "comprehensive"
}

# Chat with AI
POST /api/ai/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "我的性格特点是什么？",
  "chartData": {...},
  "sessionId": "session_123"
}
```

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
npm run lint         # Lint code
npm run lint:fix     # Fix linting issues
npm run docker:build # Build Docker image
npm run docker:run   # Run Docker container
```

### Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test -- --testNamePattern="User"

# Run with coverage
npm test -- --coverage
```

### API Testing

```bash
# Health check
curl http://localhost:3000/health

# Test authentication
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"password123"}'
```

## 📦 Deployment

### Production Deployment

1. **Server Setup**
   ```bash
   # Install Docker & Docker Compose
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh

   # Install Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

2. **Deploy Application**
   ```bash
   ./deploy.sh
   ```

3. **Setup SSL (optional)**
   ```bash
   # Add SSL certificates to nginx/ssl/
   cp your-cert.pem nginx/ssl/cert.pem
   cp your-key.pem nginx/ssl/key.pem

   # Restart nginx
   docker-compose restart nginx
   ```

### Monitoring

```bash
# View logs
docker-compose logs -f api

# Monitor resource usage
docker stats

# Check service status
docker-compose ps
```

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Rate Limiting** - Prevent API abuse
- **Input Validation** - Comprehensive request validation
- **CORS Protection** - Cross-origin security
- **Helmet Security** - HTTP security headers
- **Password Hashing** - BCrypt password protection
- **SQL Injection Prevention** - MongoDB parameterized queries

## 📊 Performance

- **Redis Caching** - Fast data retrieval
- **Database Indexing** - Optimized MongoDB queries
- **Compression** - Gzip response compression
- **Connection Pooling** - Efficient database connections
- **Graceful Shutdown** - Clean process termination

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/your-repo/bazi-fortune-app/issues)
- **Documentation**: [API Docs](https://api.bazi-fortune.com/docs)
- **Email**: support@bazi-fortune.com

---

Built with ❤️ for the BaZi Fortune App ecosystem.