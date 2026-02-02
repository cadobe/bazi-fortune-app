# 🚀 Railway Deployment - Action Checklist

## ✅ What's Already Done

- [x] Git repository initialized and configured
- [x] All code committed to local Git
- [x] GitHub remote configured: `https://github.com/cadobe/bazi-fortune-app.git`
- [x] Railway configuration files created
- [x] Secure JWT secret generated
- [x] Environment variables documented
- [x] Deployment guides created

---

## 📋 What You Need To Do Now

### **ACTION 1: Push Code to GitHub** ⏱️ 2 minutes

Your GitHub remote is already configured. Now push your code:

```bash
cd /home/nickshan/code/bazi-fortune-app
git push -u origin main
```

**If prompted for authentication:**
- Username: Your GitHub username (`cadobe`)
- Password: Use a **Personal Access Token** (not your GitHub password)

**Don't have a token? Create one:**
1. Go to: https://github.com/settings/tokens/new
2. Note: `Railway Deployment`
3. Expiration: 90 days (or longer)
4. Select scopes: ✅ `repo` (Full control of private repositories)
5. Click "Generate token"
6. **Copy the token immediately** (you won't see it again!)
7. Use this token as your password when pushing

**Alternative: Use SSH instead of HTTPS**
```bash
# If you have SSH keys set up with GitHub:
git remote set-url origin git@github.com:cadobe/bazi-fortune-app.git
git push -u origin main
```

---

### **ACTION 2: Create Railway Project** ⏱️ 10 minutes

Once your code is on GitHub, follow these steps:

#### Step 1: Sign Up for Railway
1. Go to: https://railway.app
2. Click **"Start a New Project"** or **"Login"**
3. **Sign in with GitHub** (recommended - makes deployment easier)
4. Authorize Railway to access your repositories

#### Step 2: Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Find and select **`cadobe/bazi-fortune-app`**
4. Railway will start analyzing your repository

#### Step 3: Configure Root Directory
1. Click on your service (shows "bazi-fortune-backend")
2. Go to **Settings** tab
3. Find **"Root Directory"** under "Source" section
4. Enter: `backend`
5. Save changes

#### Step 4: Add MongoDB
1. Click **"+ New"** in your project
2. Select **"Database"** → **"Add MongoDB"**
3. Wait for deployment (green checkmark)

#### Step 5: Add Redis
1. Click **"+ New"** again
2. Select **"Database"** → **"Add Redis"**
3. Wait for deployment (green checkmark)

#### Step 6: Configure Environment Variables
1. Click on your **backend service** (not databases)
2. Go to **"Variables"** tab
3. Click **"RAW Editor"**
4. Paste the following (replace `YOUR_OPENAI_KEY`):

```bash
NODE_ENV=production
MONGODB_URI=${{MongoDB.MONGO_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
JWT_SECRET=d3a9d9ae2da8c6b3dddb7d22d29f235dfd3b5d37b787229ac8cdd05ad519ebf9b03f137b4d716a7e0dff41796cdf77115e70a4a0a46f07e1319c9b5707520752
JWT_EXPIRE=7d
LLM_PROVIDER=zhipu
LLM_API_KEY=YOUR_ZHIPU_API_KEY_HERE
LLM_MODEL=glm-4-flash
FRONTEND_URL=${{RAILWAY_PUBLIC_DOMAIN}}
UPLOAD_MAX_SIZE=10485760
UPLOAD_PATH=./uploads
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

**⚠️ IMPORTANT:** Replace `YOUR_ZHIPU_API_KEY_HERE` with your actual Zhipu GLM API key!

**如何获取智谱 API Key（免费）：**
1. 访问 https://open.bigmodel.cn/
2. 注册/登录账号
3. 进入控制台 → API Keys
4. 创建新 API Key
5. 复制密钥

**详细申请指南：** 查看 [`GLM_API_SETUP_GUIDE.md`](GLM_API_SETUP_GUIDE.md)

5. Railway will automatically redeploy with new variables

#### Step 7: Generate Public URL
1. Go to **Settings** tab
2. Scroll to **"Networking"** or **"Domains"**
3. Click **"Generate Domain"**
4. Railway creates a URL like: `bazi-fortune-app-production.up.railway.app`

#### Step 8: Monitor Deployment
1. Go to **"Deployments"** tab
2. Click on the active deployment
3. Watch logs until you see **"SUCCESS"** ✅

---

### **ACTION 3: Test Your Deployment** ⏱️ 2 minutes

Once deployed, test your API:

#### Test Health Endpoint
```bash
# Replace with your actual Railway URL
curl https://YOUR-APP.up.railway.app/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-28T...",
  "uptime": 123,
  "services": {
    "mongodb": "connected",
    "redis": "connected"
  }
}
```

#### Test User Registration
```bash
curl -X POST https://YOUR-APP.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456",
    "username": "testuser"
  }'
```

---

## 📊 Quick Reference

### Key Files Created
- [`/DEPLOY_TO_RAILWAY.md`](/home/nickshan/code/bazi-fortune-app/DEPLOY_TO_RAILWAY.md) - Complete deployment guide
- [`/backend/RAILWAY_ENV_SETUP.md`](/home/nickshan/code/bazi-fortune-app/backend/RAILWAY_ENV_SETUP.md) - Environment variables reference
- [`/backend/nixpacks.toml`](/home/nickshan/code/bazi-fortune-app/backend/nixpacks.toml) - Railway build configuration
- [`/backend/railway.json`](/home/nickshan/code/bazi-fortune-app/backend/railway.json) - Railway service configuration

### Important Values
- **GitHub Repository:** `https://github.com/cadobe/bazi-fortune-app`
- **Root Directory:** `backend`
- **Start Command:** `npm start` (auto-detected)
- **Health Check:** `/health`
- **JWT Secret:** `d3a9d9ae2da8c6b3dddb7d22d29f235dfd3b5d37b787229ac8cdd05ad519ebf9b03f137b4d716a7e0dff41796cdf77115e70a4a0a46f07e1319c9b5707520752`

### API Endpoints (After Deployment)
- Health: `GET /health`
- Register: `POST /api/auth/register`
- Login: `POST /api/auth/login`
- Charts: `GET/POST /api/charts`
- AI Analysis: `POST /api/ai/analyze`
- AI Chat: `POST /api/ai/chat`

---

## 🆘 Troubleshooting

### Can't Push to GitHub
- Use a Personal Access Token, not your password
- Or set up SSH keys: https://docs.github.com/en/authentication/connecting-to-github-with-ssh

### Railway Build Fails
- Check that Root Directory is set to `backend`
- Verify Node.js version in logs (should be 18.x)
- Check build logs for specific errors

### Database Connection Issues
- Ensure MongoDB and Redis show green checkmarks in Railway
- Verify environment variables: `MONGODB_URI=${{MongoDB.MONGO_URL}}`
- Try restarting the service

### Health Check Failing
- Wait 1-2 minutes after deployment for services to fully start
- Check deploy logs for errors
- Verify MongoDB and Redis are connected

---

## 💡 Pro Tips

1. **Use Railway's CLI later** for faster deployments:
   ```bash
   npm i -g railway
   railway login
   railway up
   ```

2. **Monitor costs** in Railway dashboard → Usage tab

3. **Set up alerts** in Railway dashboard → Project Settings → Notifications

4. **Custom domain?** Add it in Settings → Domains → Add Custom Domain

5. **Environment changes** trigger automatic redeployment

---

## ✅ Success Criteria

Your deployment is successful when:
- ✅ Railway deployment shows "SUCCESS" status
- ✅ `/health` endpoint returns 200 OK with database status
- ✅ User registration endpoint works
- ✅ No errors in Railway logs
- ✅ MongoDB and Redis show as connected

---

## 📞 Support Resources

- **Full Deployment Guide:** See `DEPLOY_TO_RAILWAY.md`
- **Railway Docs:** https://docs.railway.app
- **Railway Discord:** https://discord.gg/railway
- **OpenAI API Docs:** https://platform.openai.com/docs

---

**Total Time Estimate:** ~15-20 minutes
**Difficulty:** Beginner-friendly

🎯 **Ready? Start with ACTION 1 above!**
