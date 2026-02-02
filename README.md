# 八字排盘算命小程序

一款结合传统命理学与现代AI技术的专业命理服务应用。

## 项目结构

```
bazi-fortune-app/
├── frontend/
│   ├── miniprogram/          # 微信小程序
│   └── h5/                   # H5/Web端
├── backend/                  # 后端服务
├── docs/                     # 项目文档
└── assets/                   # 静态资源
    ├── images/
    └── icons/
```

## 核心功能

1. **一键排盘** - 输入生辰八字，快速生成命盘
2. **智能命理解读** - AI生成专业命理分析报告
3. **多命盘对比** - 合婚分析、缘分评估
4. **知识学习模块** - 八字命理知识库
5. **黄历择日** - 万年历查询，吉日推荐
6. **运势提醒** - 个人运势推送服务
7. **多端同步** - 云端数据同步
8. **社区互动** - 命理交流论坛
9. **个性化设置** - 多主题，多语言支持
10. **增值服务** - 专业命理师咨询

## 技术栈

### 前端
- 微信小程序原生框架
- Vue.js 3 + Vite (H5)
- Vant Weapp / Element Plus
- Pinia 状态管理

### 后端
- Node.js + Express
- MongoDB + Redis
- JWT认证
- OpenAI GPT集成

### 核心算法
- JavaScript八字排盘算法
- 农历转换算法
- 真太阳时校正
- 五行生克计算

## 开发进度

- [x] 项目架构设计
- [ ] 八字排盘核心算法
- [ ] 前端UI组件
- [ ] AI命理解读集成
- [ ] 后端API服务
- [ ] 数据库设计
- [ ] 多端同步功能
- [ ] 社区功能
- [ ] 测试与优化

## 快速开始

### 前端开发
```bash
# 进入前端目录
cd frontend/miniprogram
# 使用微信开发者工具打开

cd frontend/h5
npm install
npm run dev
```

### 后端开发
```bash
cd backend
npm install
npm start
```

## 部署说明

待补充...

## 许可证

MIT License# bazi-fortune-app
