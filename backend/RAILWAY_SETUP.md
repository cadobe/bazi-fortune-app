# Railway 部署配置指南

## ⚠️ 重要：必须添加数据库服务

你的应用正在崩溃，因为缺少 MongoDB 和 Redis。请按以下步骤操作：

## 步骤 1: 添加 MongoDB 数据库

1. 在 Railway Dashboard 中，点击你的项目
2. 点击 **"New"** → **"Database"** → **"Add MongoDB"**
3. 等待 MongoDB 部署完成
4. Railway 会自动设置环境变量：
   - `MONGO_URL` 或 `MONGODB_URI`

## 步骤 2: 添加 Redis 缓存

1. 点击 **"New"** → **"Database"** → **"Add Redis"**
2. 等待 Redis 部署完成
3. Railway 会自动设置环境变量：
   - `REDIS_URL`

## 步骤 3: 配置环境变量

在 Railway 项目的 **Variables** 页面中，确保有以下变量：

### 必需的环境变量

```bash
# Node 环境
NODE_ENV=production
PORT=8080

# JWT 配置
JWT_SECRET=你的超级密钥_请改成随机字符串
JWT_EXPIRE=7d

# AI 服务配置
LLM_PROVIDER=zhipu
LLM_API_KEY=3984443f4379480385ec7102cfda47e2.mAGKQM0oQpAbUW4C
LLM_MODEL=glm-4-flash

# 前端 URL（可选，如果有前端的话）
FRONTEND_URL=https://你的前端域名.com
```

### 数据库变量（Railway 自动生成）

这些会在你添加数据库后自动创建：
- `MONGODB_URI` 或 `MONGO_URL`
- `REDIS_URL`

## 步骤 4: 重新部署

1. 添加完数据库后，应用会自动重新部署
2. 检查 **Deployments** 页面，确保没有错误
3. 查看 **Logs**，应该看到：
   ```
   Connected to MongoDB
   Connected to Redis
   Server running on port 8080
   ```

## 步骤 5: 生成公开域名

如果还没有公开域名：
1. 进入 **Settings** → **Networking**
2. 点击 **"Generate Domain"**
3. 获取类似这样的 URL：`https://bazi-fortune-app-production.up.railway.app`

## 验证部署

访问这些端点测试：

```bash
# 健康检查
https://你的域名.railway.app/health

# API 根路径
https://你的域名.railway.app/api
```

## 常见问题

### 应用一直崩溃重启？
- ✅ 检查是否添加了 MongoDB 和 Redis
- ✅ 检查环境变量是否正确配置
- ✅ 查看 Logs 确认错误信息

### MongoDB 连接失败？
- 确保使用 Railway 自动生成的 `MONGODB_URI`
- 检查连接字符串格式是否正确

### Redis 连接失败？
- 现在应用会继续运行，即使 Redis 连接失败
- 但建议添加 Redis 以获得更好的性能

## 成本说明

- **MongoDB**: Railway 提供免费额度
- **Redis**: Railway 提供免费额度
- **总计**: 在免费额度内无需付费

## 下一步

1. ✅ 添加 MongoDB 数据库
2. ✅ 添加 Redis 缓存
3. ✅ 配置环境变量
4. ✅ 等待自动重新部署
5. ✅ 测试 API 端点
