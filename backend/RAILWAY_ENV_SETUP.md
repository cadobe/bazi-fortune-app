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

### AI Service (REQUIRED - Get from OpenAI)
```
OPENAI_API_KEY=sk-YOUR_OPENAI_KEY_HERE
OPENAI_MODEL=gpt-4
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
OPENAI_API_KEY=sk-YOUR_OPENAI_KEY_HERE
OPENAI_MODEL=gpt-4
FRONTEND_URL=https://your-app.up.railway.app
UPLOAD_MAX_SIZE=10485760
UPLOAD_PATH=./uploads
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

---

## Important Notes

1. **OPENAI_API_KEY is REQUIRED** - The app will not work without it
2. **Update FRONTEND_URL** after getting your Railway deployment URL
3. **Email settings are optional** - Only add if you want email notifications
4. MongoDB and Redis URLs will be auto-populated when you add those databases in Railway
