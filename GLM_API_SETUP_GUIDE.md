# 🆓 智谱 GLM-4-Flash API 申请指南

智谱 GLM-4-Flash 是**完全免费**的国产大模型，性能优秀且 API 兼容 OpenAI 格式。

---

## 📋 申请步骤（5分钟完成）

### **步骤 1：注册智谱账号**

1. 访问智谱开放平台：https://open.bigmodel.cn/
2. 点击右上角**"注册"**或**"登录"**
3. 使用以下方式之一注册：
   - 手机号注册（推荐）
   - 微信扫码登录
   - 邮箱注册

### **步骤 2：实名认证（可选但推荐）**

完成实名认证后可获得更高的免费额度：
1. 登录后点击右上角头像
2. 进入**"个人中心"**
3. 完成**"实名认证"**
4. 需要身份证照片和人脸识别

### **步骤 3：创建 API Key**

1. 登录后进入**"控制台"**：https://open.bigmodel.cn/usercenter/apikeys
2. 点击**"创建新的 API Key"**
3. 输入密钥名称（如：`bazi-fortune-app`）
4. 点击**"提交"**
5. **立即复制并保存 API Key**（只显示一次！）

**API Key 格式示例：**
```
abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

---

## 🎁 免费额度说明

### **GLM-4-Flash 免费额度**

| 项目 | 额度 |
|------|------|
| **价格** | 完全免费 ✅ |
| **QPS 限制** | 根据认证等级 |
| **并发数** | 普通用户：5，认证用户：10 |
| **使用期限** | 永久免费 |
| **适用场景** | 对话、分析、生成等所有场景 |

**注意：**
- 免费额度足够小型应用使用
- 如需更高 QPS，可升级到付费版（依然很便宜）

---

## 🔑 获取到的 API Key 如何使用？

### **在 Railway 中配置**

1. 进入 Railway 项目
2. 点击您的服务 → **Variables** 标签
3. 添加以下环境变量：

```bash
LLM_PROVIDER=zhipu
LLM_API_KEY=你复制的智谱API密钥
LLM_MODEL=glm-4-flash
```

### **本地测试配置**

创建 `/backend/.env` 文件：

```bash
# AI Service - 智谱 GLM
LLM_PROVIDER=zhipu
LLM_API_KEY=你的智谱API密钥
LLM_MODEL=glm-4-flash

# Other configs...
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/bazi-fortune
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret
```

---

## 🧪 测试 API Key 是否有效

### **方法 1：使用 curl 测试**

```bash
curl https://open.bigmodel.cn/api/paas/v4/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "model": "glm-4-flash",
    "messages": [
      {
        "role": "user",
        "content": "你好，请简单介绍一下自己"
      }
    ]
  }'
```

**成功响应示例：**
```json
{
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "你好！我是智谱AI开发的人工智能助手..."
      }
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 20,
    "total_tokens": 30
  }
}
```

### **方法 2：在应用中测试**

部署后访问您的 API：
```bash
curl -X POST https://your-app.up.railway.app/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "测试消息",
    "chartId": "your_chart_id"
  }'
```

---

## 🔄 支持的模型列表

智谱 AI 提供多个模型，您可以切换使用：

| 模型名称 | 价格 | 特点 | 推荐场景 |
|---------|------|------|----------|
| **glm-4-flash** | 免费 | 快速响应 | 对话、问答（推荐）|
| **glm-4** | 付费 | 高性能 | 复杂分析 |
| **glm-4-air** | 付费 | 平衡性价比 | 通用场景 |
| **glm-3-turbo** | 付费 | 快速廉价 | 大批量处理 |

**对于八字应用，使用 `glm-4-flash` 免费版完全足够！**

---

## ❓ 常见问题

### Q1: API Key 泄露了怎么办？
**A:**
1. 立即登录智谱控制台
2. 删除泄露的 API Key
3. 创建新的 API Key
4. 更新 Railway 环境变量

### Q2: 提示 "API Key 无效" 怎么办？
**A:** 检查：
- API Key 是否完整复制（没有多余空格）
- 是否在智谱控制台中启用了该 Key
- 是否选择了正确的模型（`glm-4-flash`）

### Q3: 超过免费额度怎么办？
**A:**
- GLM-4-Flash 目前完全免费
- 如果遇到 QPS 限制，可以：
  - 等待一段时间后重试
  - 升级账号认证等级
  - 或使用付费额度（依然很便宜）

### Q4: 可以同时使用多个 API Key 吗？
**A:**
- 单个应用实例只能配置一个 API Key
- 但您可以创建多个 Key，用于不同环境（开发/生产）

### Q5: 如何查看使用量？
**A:**
1. 登录智谱控制台
2. 进入**"用量统计"**页面
3. 查看 API 调用次数和 token 消耗

---

## 📚 相关链接

- **智谱开放平台：** https://open.bigmodel.cn/
- **API 文档：** https://open.bigmodel.cn/dev/api
- **控制台：** https://open.bigmodel.cn/usercenter/apikeys
- **用量统计：** https://open.bigmodel.cn/usercenter/usage
- **开发文档：** https://open.bigmodel.cn/dev/howuse/introduction

---

## 🎯 下一步

获取 API Key 后：

1. ✅ 在 Railway 中配置环境变量
2. ✅ 触发重新部署
3. ✅ 测试 AI 功能
4. ✅ 开始使用免费的 AI 八字分析！

---

## 💡 温馨提示

- **保护好您的 API Key**，不要提交到 Git 仓库
- **首次使用建议**先在本地测试，确认可用后再部署
- **性能优化**：GLM-4-Flash 响应速度快，适合实时对话
- **中文优化**：智谱模型对中文理解优秀，非常适合八字命理场景

---

**🎉 恭喜！您现在可以完全免费使用 AI 功能了！**
