# Railway Environment Variables Setup Guide

Copy these environment variables into your Railway project settings.

## Auto-Configured by Railway (after adding databases)
```
MONGODB_URI=${{MongoDB.MONGO_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
PORT=${{PORT}}
```

## Required - Add These Manually

### Application Settings
```
NODE_ENV=production
```

### Security (CRITICAL - Use the generated values below)
```
JWT_SECRET=d3a9d9ae2da8c6b3dddb7d22d29f235dfd3b5d37b787229ac8cdd05ad519ebf9b03f137b4d716a7e0dff41796cdf77115e70a4a0a46f07e1319c9b5707520752
JWT_EXPIRE=7d
```

### AI Service (使用智谱 GLM-4-Flash - 免费！)
```
LLM_PROVIDER=zhipu
LLM_API_KEY=YOUR_ZHIPU_API_KEY_HERE
LLM_MODEL=glm-4-flash
```
**获取智谱 API Key（免费）：**
1. 访问 https://open.bigmodel.cn/
2. 注册/登录账号
3. 进入控制台 → API Keys
4. 创建新的 API Key
5. 复制密钥（格式类似：`abc123def456...`）

**或使用 OpenAI（付费）：**
```
LLM_PROVIDER=openai
LLM_API_KEY=sk-your-openai-key
LLM_MODEL=gpt-4
```
**Get your key from:** https://platform.openai.com/api-keys

### Frontend URL (Update after deployment)
```
FRONTEND_URL=https://your-railway-app.up.railway.app
```
**Note:** Update this with your actual Railway URL after deployment

### Email Service (Optional - for notifications)
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
```
**Gmail App Password:** https://myaccount.google.com/apppasswords

### File Upload Settings
```
UPLOAD_MAX_SIZE=10485760
UPLOAD_PATH=./uploads
```

### Rate Limiting
```
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

---

## Quick Copy-Paste (Update OPENAI_API_KEY!)

```
NODE_ENV=production
JWT_SECRET=d3a9d9ae2da8c6b3dddb7d22d29f235dfd3b5d37b787229ac8cdd05ad519ebf9b03f137b4d716a7e0dff41796cdf77115e70a4a0a46f07e1319c9b5707520752
JWT_EXPIRE=7d
LLM_PROVIDER=zhipu
LLM_API_KEY=YOUR_ZHIPU_API_KEY_HERE
LLM_MODEL=glm-4-flash
FRONTEND_URL=https://your-app.up.railway.app
UPLOAD_MAX_SIZE=10485760
UPLOAD_PATH=./uploads
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

---

## Important Notes

1. **LLM_API_KEY is REQUIRED** - Get free API key from https://open.bigmodel.cn
2. **Using GLM-4-Flash is FREE** - Zero cost for AI features!
3. **Update FRONTEND_URL** after getting your Railway deployment URL
4. **Email settings are optional** - Only add if you want email notifications
5. MongoDB and Redis URLs will be auto-populated when you add those databases in Railway
