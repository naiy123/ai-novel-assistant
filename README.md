# 📝 AI 小说写作助手

基于 Google Vertex AI 的智能小说创作平台，支持中国用户访问。

## ✨ 核心功能

- 📚 **小说管理**：创建、编辑、管理多部小说
- 📝 **章节编辑**：Markdown 编辑器，自动保存，实时字数统计
- 🎴 **卡片库**：管理人物、物品、场景设定
- 🤖 **AI 辅助**：根据大纲和卡片智能生成内容（500-5000字）
- 💾 **自动保存**：3秒自动保存，防止内容丢失

## 🏗️ 架构

```
用户（中国）
    ↓
前端网页（可部署在中国）
    ↓
后端服务器（需访问 Google API）
    ↓
Google Vertex AI
```

**关键**：只有后端需要访问 Google API（需要海外服务器或代理），前端和用户无需代理。

## 🚀 快速开始

### 1. 安装依赖

```bash
# 后端
cd backend
npm install

# 前端
cd frontend
npm install
```

### 2. 配置 Google Cloud

1. 创建 Google Cloud 项目
2. 启用 Vertex AI API
3. 创建服务账号并下载 JSON 密钥
4. 将密钥保存到 `backend/credentials/google-cloud-key.json`

详见：[Google-Cloud-配置指南.md](./Google-Cloud-配置指南.md)

### 3. 配置环境变量

创建 `backend/.env`：

```env
# Google Cloud 配置
GOOGLE_APPLICATION_CREDENTIALS=backend/credentials/google-cloud-key.json
VERTEX_AI_PROJECT_ID=your-project-id
VERTEX_AI_LOCATION=us-central1

# 如果后端在中国，需要配置代理
# HTTP_PROXY=http://127.0.0.1:7890
# HTTPS_PROXY=http://127.0.0.1:7890
```

### 4. 启动应用

```bash
# 终端 1：启动后端
cd backend
npm run dev

# 终端 2：启动前端
cd frontend
npm run dev
```

访问：http://localhost:3000

**测试账号**：
- 用户名：`test`
- 密码：`123456`

## 📚 文档

| 文档 | 说明 |
|------|------|
| [README-部署指南.md](./README-部署指南.md) | **部署必读**：架构说明、部署方案、服务器配置 |
| [使用指南.md](./使用指南.md) | 功能使用、AI 写作、卡片管理 |
| [Google-Cloud-配置指南.md](./Google-Cloud-配置指南.md) | Google Cloud 详细配置（可选） |

## 🎯 推荐部署方案

### 小团队/个人

**前端**：Vercel / 阿里云 OSS（中国）  
**后端**：Google Cloud / AWS（海外）  
**成本**：¥100-150/月

### 本地开发

**Windows**：使用 `start-with-proxy.ps1` 脚本  
**需要**：本地代理（Clash/V2Ray），端口 7890

## 🔧 技术栈

**前端**：
- React 18
- Vite
- React Router
- Tailwind CSS

**后端**：
- Node.js 18+
- Express
- Google Vertex AI (Gemini)
- 内存数据库（可替换为 SQLite/PostgreSQL）

## 💡 核心特性

### 1. 智能 AI 生成

- 根据剧情大纲生成内容
- 结合人物/物品/场景卡片
- 可选字数（500-5000字）
- 自动保持人物性格一致性

### 2. 卡片系统

- **人物卡**：性格、外貌、背景
- **物品卡**：描述、作用、特性
- **场景卡**：环境、氛围、特殊信息

### 3. 编辑体验

- Markdown 格式
- 自动保存（3秒）
- 实时字数统计
- 章节快速切换

## 🌐 部署架构

### 推荐方案（生产环境）

```
┌──────────────────┐
│   阿里云 CDN     │ ← 前端静态文件（中国用户快速访问）
└────────┬─────────┘
         │
┌────────▼─────────┐
│  Google Cloud    │ ← 后端 API（美国，直接访问 Vertex AI）
│  Compute Engine  │
└────────┬─────────┘
         │
┌────────▼─────────┐
│  Vertex AI API   │
└──────────────────┘
```

**优点**：
- ✅ 中国用户访问前端快
- ✅ 后端无需代理
- ✅ 稳定可靠

详见：[README-部署指南.md](./README-部署指南.md)

## 📊 API 用量

**Gemini 2.5 Pro 定价**（参考）：
- 输入：$1.25 / 1M tokens
- 输出：$5.00 / 1M tokens

**估算**（生成 2000 字）：
- 输入 token：~1500（提示词）
- 输出 token：~1000（生成内容）
- 成本：~$0.007 / 次

## 🔒 安全

- JWT 认证
- 密码 bcrypt 加密
- 服务账号认证（Google Cloud）
- HTTPS 加密传输（生产环境）

## 📝 TODO

- [ ] 真实数据库（SQLite/PostgreSQL）
- [ ] 用户注册功能
- [ ] 导出小说（TXT/EPUB）
- [ ] 版本历史
- [ ] 多人协作
- [ ] 章节排序

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 📞 支持

遇到问题？

1. 查看 [README-部署指南.md](./README-部署指南.md)
2. 查看 [使用指南.md](./使用指南.md)
3. 检查后端日志
4. 提交 Issue

---

**开始创作你的小说吧！✍️**
