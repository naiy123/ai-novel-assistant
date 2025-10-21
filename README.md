# 📝 AI 小说写作助手

基于 Google Vertex AI 的智能小说创作平台，支持中国用户访问。

---

## ✨ 核心功能

- 📚 **小说管理** - 创建、编辑、管理多部小说
- 📝 **章节编辑** - Markdown编辑器，自动保存，实时字数统计
- 🎴 **卡片库** - 管理人物、物品、场景设定
- 🤖 **AI辅助** - 根据大纲智能生成内容（500-5000字）
- 💾 **自动保存** - 3秒自动保存，防止内容丢失

---

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

### 2. 配置Google Cloud

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建项目并启用 Vertex AI API
3. 下载服务账号密钥到 `backend/credentials/google-cloud-key.json`
4. 创建 `backend/.env` 文件：

```env
GOOGLE_APPLICATION_CREDENTIALS=credentials/google-cloud-key.json
VERTEX_AI_PROJECT_ID=你的项目ID
VERTEX_AI_LOCATION=us-central1
PORT=5000
JWT_SECRET=your-secret-key
```

**详细配置**：查看 [Google-Cloud-配置指南.md](./Google-Cloud-配置指南.md)

### 3. 启动应用

```bash
# 终端1：启动后端
cd backend
npm run dev

# 终端2：启动前端
cd frontend
npm run dev
```

访问：http://localhost:3000

**测试账号**：用户名 `test`，密码 `123456`

---

## 📚 文档导航

| 文档 | 说明 | 阅读时间 |
|------|------|----------|
| **[快速开始.md](./快速开始.md)** | 本地开发快速入门 | 5分钟 ⭐ |
| **[使用指南.md](./使用指南.md)** | 功能使用教程 | 15分钟 |
| [Google-Cloud-配置指南.md](./Google-Cloud-配置指南.md) | Google Cloud配置 | 10分钟 |
| [Windows部署说明.md](./Windows部署说明.md) | Windows生产环境部署 | 5分钟 |
| [管理命令.md](./管理命令.md) | PM2服务管理 | 3分钟 |

---

## 🏗️ 架构说明

```
用户（中国）
    ↓
前端网页（可部署在中国）
    ↓
后端服务器（需访问Google API）
    ↓
Google Vertex AI
```

**关键点**：
- ✅ 前端可以部署在中国（阿里云、腾讯云等）
- ✅ 后端需要能访问Google API（海外服务器或使用代理）
- ✅ 用户无需代理，正常访问前端即可

---

## 🔧 技术栈

**前端**：React 18 + Vite + React Router + Tailwind CSS  
**后端**：Node.js 18+ + Express + Google Vertex AI (Gemini)  
**数据库**：内存数据库（可替换为SQLite/PostgreSQL）

---

## 🛠️ 常用命令

### 开发环境

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### Git版本管理

```bash
# 使用一键脚本（推荐）
.\快速推送.bat

# 或手动执行
git add .
git commit -m "更新说明"
git push
```

### PM2服务管理

```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs

# 重启服务
pm2 restart all
```

**完整命令**：查看 [管理命令.md](./管理命令.md)

---

## 💡 部署方案

### 本地开发（Windows）
- 前端：`npm run dev` (端口3000)
- 后端：`npm run dev` (端口5000)
- 如需代理：使用 `start-with-proxy.ps1`

### 生产环境（Windows Server）
- 使用PM2管理服务
- 前端：端口80
- 后端：端口5000
- **详见**：[Windows部署说明.md](./Windows部署说明.md)

### 推荐部署（中国用户）
- 前端：阿里云OSS / 腾讯云COS
- 后端：Google Cloud / AWS（海外）
- 成本：约¥100-150/月

---

## 🆘 常见问题

### Q1：无法连接Google API

**原因**：Google API在中国被墙  
**解决**：
- 本地开发：使用 `start-with-proxy.ps1`（需本地代理）
- 生产环境：将后端部署到海外服务器

### Q2：AI生成失败

**检查步骤**：
1. 查看后端日志：`pm2 logs ai-novel-backend`
2. 测试连接：`node backend/test-vertex-ai.js`
3. 检查Google Cloud配额和密钥

### Q3：前端页面空白

**解决**：
1. 检查后端是否运行
2. 检查浏览器控制台错误
3. 确认API地址配置正确

---

## 📊 AI用量估算

**Gemini 2.5 Pro定价**：
- 输入：$1.25 / 1M tokens
- 输出：$5.00 / 1M tokens

**生成2000字成本**：约$0.007/次

---

## 🔒 安全提醒

- ✅ JWT认证
- ✅ 密码bcrypt加密
- ⚠️ 生产环境请修改 `JWT_SECRET`
- ⚠️ 不要提交 `credentials/*.json` 到Git
- ⚠️ 建议配置HTTPS

---

## 📝 开发计划

- [ ] 真实数据库（SQLite/PostgreSQL）
- [ ] 用户注册功能
- [ ] 导出小说（TXT/EPUB）
- [ ] 版本历史
- [ ] 多人协作

---

## 🤝 贡献

欢迎提交Issue和Pull Request！

---

## 📄 许可证

MIT License

---

## 🎯 下一步

1. 阅读 [快速开始.md](./快速开始.md) 了解如何启动项目
2. 阅读 [使用指南.md](./使用指南.md) 学习如何使用AI辅助写作
3. 开始创作你的第一部小说 ✍️

---

**开始你的AI写作之旅吧！🚀**
