# 🚀 Complete Railway Deployment Guide for BaZi Fortune App

This guide will walk you through deploying your BaZi Fortune App backend to Railway step-by-step.

---

## ✅ Prerequisites (Already Completed)

- [x] Git repository initialized
- [x] Code committed to Git
- [x] Railway configuration files ready
- [x] Environment variables generated
- [x] Secure JWT secret created

---

## 📋 Step-by-Step Deployment Instructions

### **STEP 1: Create GitHub Repository** (5 minutes)

Since the GitHub CLI is not available, create the repository manually:

#### 1.1 Create Repository on GitHub
1. Go to https://github.com/new
2. Repository name: `bazi-fortune-app`
3. Description: `BaZi Fortune Telling App - AI-powered Chinese astrology service`
4. Visibility: **Private** (recommended) or Public
5. **DO NOT** initialize with README, .gitignore, or license
6. Click **"Create repository"**

#### 1.2 Push Your Code to GitHub
After creating the repository, run these commands:

```bash
cd /home/nickshan/code/bazi-fortune-app
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/bazi-fortune-app.git
git push -u origin main
```

**Replace `YOUR_GITHUB_USERNAME`** with your actual GitHub username.

**Note:** You may need to authenticate. GitHub now requires Personal Access Tokens:
- If prompted, create a token at: https://github.com/settings/tokens
- Select scopes: `repo` (full control of private repositories)
- Copy the token and use it as your password when pushing

---

### **STEP 2: Create Railway Account** (2 minutes)

1. Go to https://railway.app
2. Click **"Login"** or **"Start a New Project"**
3. Sign up with **GitHub** (recommended) - this makes deployment easier
4. Authorize Railway to access your GitHub repositories

---

### **STEP 3: Create New Railway Project** (1 minute)

1. On Railway dashboard, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose **`bazi-fortune-app`** from your repository list
4. Railway will start analyzing your repository

---

### **STEP 4: Configure Root Directory** (1 minute)

Since your backend code is in the `backend/` folder:

1. Click on your deployment service (should show "bazi-fortune-backend")
2. Go to **Settings** tab
3. Scroll to **"Source"** section
4. Find **"Root Directory"**
5. Enter: `backend`
6. Click **"Save"** or wait for auto-save

---

### **STEP 5: Add MongoDB Database** (2 minutes)

1. In your Railway project, click **"+ New"** button
2. Select **"Database"**
3. Choose **"Add MongoDB"**
4. Railway will provision a MongoDB instance
5. Wait for it to deploy (shows green checkmark when ready)

**Railway automatically creates these variables:**
- `MONGO_URL`
- `MONGO_PRIVATE_URL`

---

### **STEP 6: Add Redis Database** (2 minutes)

1. Click **"+ New"** button again
2. Select **"Database"**
3. Choose **"Add Redis"**
4. Railway will provision a Redis instance
5. Wait for it to deploy (green checkmark)

**Railway automatically creates these variables:**
- `REDIS_URL`
- `REDIS_PRIVATE_URL`

---

### **STEP 7: Configure Environment Variables** (5 minutes)

This is the most important step!

1. Click on your **backend service** (not the databases)
2. Go to **"Variables"** tab
3. Click **"RAW Editor"** for easier bulk entry

#### 7.1 Add Required Variables

**Option A: Use RAW Editor (Faster)**

Click "RAW Editor" and paste this (update OPENAI_API_KEY!):

```
NODE_ENV=production
MONGODB_URI=${{MongoDB.MONGO_URL}}
REDIS_URL=${{Redis.REDIS_URL}}
JWT_SECRET=d3a9d9ae2da8c6b3dddb7d22d29f235dfd3b5d37b787229ac8cdd05ad519ebf9b03f137b4d716a7e0dff41796cdf77115e70a4a0a46f07e1319c9b5707520752
JWT_EXPIRE=7d
OPENAI_API_KEY=sk-YOUR_OPENAI_KEY_HERE
OPENAI_MODEL=gpt-4
FRONTEND_URL=${{RAILWAY_PUBLIC_DOMAIN}}
UPLOAD_MAX_SIZE=10485760
UPLOAD_PATH=./uploads
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

**CRITICAL:** Replace `sk-YOUR_OPENAI_KEY_HERE` with your actual OpenAI API key!

**Option B: Add Variables One by One**

Click "+ New Variable" and add each variable individually.

#### 7.2 Get Your OpenAI API Key

If you don't have an OpenAI API key:
1. Go to https://platform.openai.com/api-keys
2. Click **"Create new secret key"**
3. Name it "BaZi Fortune App"
4. Copy the key (starts with `sk-`)
5. Paste it as the `OPENAI_API_KEY` value in Railway

**Important:** You need billing set up on OpenAI to use GPT-4. Alternatively, use `gpt-3.5-turbo` as the model.

#### 7.3 Save and Deploy

After adding all variables:
1. Railway will automatically redeploy
2. Or click **"Deploy"** if needed

---

### **STEP 8: Monitor Deployment** (3-5 minutes)

1. Go to **"Deployments"** tab
2. Click on the latest deployment
3. Watch the **"Build Logs"** and **"Deploy Logs"**
4. Wait for status to show **"SUCCESS"** with green checkmark

**What Railway does:**
- Installs dependencies (`npm ci`)
- Runs health checks on `/health`
- Assigns a public URL

---

### **STEP 9: Get Your Deployment URL** (1 minute)

1. Go to **"Settings"** tab
2. Scroll to **"Domains"** section
3. Click **"Generate Domain"**
4. Railway creates a URL like: `bazi-fortune-app-production.up.railway.app`
5. Copy this URL

**Optional:** Add a custom domain if you have one.

---

### **STEP 10: Test Your Deployment** (2 minutes)

#### 10.1 Test Health Endpoint

Open your browser or use curl:

```bash
curl https://YOUR-APP.up.railway.app/health
```

Expected response:
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

#### 10.2 Test API Endpoints

```bash
# Test auth endpoint
curl -X POST https://YOUR-APP.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456","username":"testuser"}'
```

---

## 🎉 Deployment Complete!

Your BaZi Fortune App backend is now live on Railway!

**Your API Base URL:** `https://YOUR-APP.up.railway.app`

**Available Endpoints:**
- Health Check: `GET /health`
- User Registration: `POST /api/auth/register`
- User Login: `POST /api/auth/login`
- Create Chart: `POST /api/charts`
- Get Charts: `GET /api/charts`
- AI Analysis: `POST /api/ai/analyze`
- AI Chat: `POST /api/ai/chat`

---

## 📊 Post-Deployment Tasks

### Update Frontend URL

If you're using a custom frontend URL (not Railway):
1. Go to Railway Variables
2. Update `FRONTEND_URL` to your actual frontend domain
3. Save (auto-redeploys)

### Enable Email Notifications (Optional)

Add these variables in Railway:
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
```

Gmail App Password: https://myaccount.google.com/apppasswords

---

## 💰 Cost Information

**Railway Pricing:**
- **Hobby Plan:** $5/month (500 hours)
- **Usage-based:** ~$0.000463/GB-hour for MongoDB/Redis
- **Estimated monthly cost:** $7-12 for this app
- **Free trial:** $5 credit to start

**Cost Optimization:**
- Railway auto-sleeps inactive services
- MongoDB/Redis are shared in same project
- No separate hosting needed

---

## 🔍 Monitoring & Logs

**View Logs:**
1. Click on your service
2. Go to **"Deployments"** or **"Observability"** tab
3. Real-time logs show all requests and errors

**Health Checks:**
- Railway checks `/health` every 30 seconds
- Auto-restarts on failures (up to 10 retries)

**Metrics:**
- CPU usage
- Memory usage
- Request counts
- Response times

---

## 🐛 Troubleshooting

### Deployment Failed

**Check Build Logs:**
- Click on failed deployment
- Review error messages
- Common issues:
  - Missing dependencies: Check package.json
  - Root directory not set: Should be `backend`
  - Node version: Specified in package.json (>=16.0.0)

### Database Connection Failed

**Check:**
1. MongoDB and Redis are deployed (green checkmarks)
2. Environment variables reference: `${{MongoDB.MONGO_URL}}` and `${{Redis.REDIS_URL}}`
3. Restart service if needed

### Health Check Failing

**Check:**
1. `/health` endpoint exists in code (it does in server.js)
2. Database connections are established
3. View deploy logs for errors

### OpenAI API Errors

**Check:**
1. API key is correct (starts with `sk-`)
2. Billing is set up on OpenAI account
3. Model is correct (`gpt-4` or `gpt-3.5-turbo`)
4. Check Railway logs for specific error messages

---

## 🔐 Security Checklist

- [x] JWT_SECRET is strong and random (128 characters hex)
- [ ] OPENAI_API_KEY is added (you need to do this)
- [x] NODE_ENV is set to `production`
- [x] MongoDB/Redis use Railway's private network
- [x] CORS configured in code
- [x] Rate limiting enabled
- [x] Helmet.js security headers active

---

## 📚 Useful Commands

### Redeploy Application
In Railway dashboard:
- Go to Deployments → Click "Redeploy" on latest deployment

### View Environment Variables
```bash
# Railway dashboard → Variables tab
```

### Restart Service
```bash
# Railway dashboard → Settings → Restart
```

### Check Service Status
```bash
curl https://YOUR-APP.up.railway.app/health
```

---

## 🆘 Need Help?

**Railway Documentation:**
- https://docs.railway.app

**Railway Discord:**
- https://discord.gg/railway

**BaZi Fortune App Logs:**
- Railway Dashboard → Your Service → Deployments → Latest → View Logs

---

## 📝 Quick Reference

| Item | Value |
|------|-------|
| **Project Name** | bazi-fortune-app |
| **Root Directory** | `backend` |
| **Start Command** | `npm start` |
| **Health Check** | `/health` |
| **Port** | Auto-assigned by Railway |
| **Node Version** | 18.x (via nixpacks.toml) |
| **Databases** | MongoDB 6.x + Redis 7.x |

---

## ✅ Next Steps

1. ✅ Deploy backend (this guide)
2. 🔲 Test all API endpoints
3. 🔲 Deploy WeChat Mini Program frontend
4. 🔲 Update WeChat Mini Program API URLs
5. 🔲 Add custom domain (optional)
6. 🔲 Set up monitoring/alerts
7. 🔲 Configure backup strategy

---

**Created:** 2026-01-28
**Railway Config:** See [railway.json](railway.json) and [nixpacks.toml](nixpacks.toml)
**Environment Setup:** See [RAILWAY_ENV_SETUP.md](RAILWAY_ENV_SETUP.md)

---

🎯 **You're ready to deploy! Follow the steps above and your app will be live in ~20 minutes.**
