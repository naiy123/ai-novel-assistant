# 🚂 Railway 部署指南

Railway 是一个现代化的部署平台，支持从 GitHub 自动部署，非常适合部署我们的后端。

## 🎯 为什么选择 Railway？

- ✅ **免费额度**：每月 $5 免费额度（足够小项目使用）
- ✅ **自动部署**：GitHub 推送后自动部署
- ✅ **简单易用**：无需复杂配置
- ✅ **全球 CDN**：访问速度快
- ✅ **HTTPS**：自动提供 SSL 证书

## 📋 准备工作

- ✅ GitHub 仓库已创建（ai-novel-assistant）
- ✅ 后端代码已推送
- ✅ Google Cloud 密钥文件（JSON）已下载

---

## 🚀 部署步骤

### 第 1 步：注册 Railway 账号

1. 访问：https://railway.app/
2. 点击 **"Login"**
3. 选择 **"Login with GitHub"**
4. 授权 Railway 访问你的 GitHub

### 第 2 步：创建新项目

1. 登录后，点击 **"New Project"**
2. 选择 **"Deploy from GitHub repo"**
3. 如果是第一次使用：
   - 点击 **"Configure GitHub App"**
   - 选择 **"Only select repositories"**
   - 选择 **ai-novel-assistant** 仓库
   - 点击 **"Install & Authorize"**
4. 返回 Railway，在列表中选择 **ai-novel-assistant**

### 第 3 步：配置服务

1. Railway 会自动检测项目结构
2. 点击项目名称进入配置页面
3. 在 **"Settings"** 标签中：
   - **Root Directory**: 设置为 `backend`（重要！）
   - **Start Command**: 设置为 `npm start`

### 第 4 步：添加环境变量

点击 **"Variables"** 标签，添加以下变量：

#### 基础配置

```env
PORT=5000
NODE_ENV=production
JWT_SECRET=你的随机密钥-至少32位-改成复杂的字符串
```

**生成 JWT_SECRET**：
```bash
# 在本地运行生成随机密钥
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Google Cloud 配置

```env
VERTEX_AI_PROJECT_ID=你的Google项目ID
VERTEX_AI_LOCATION=us-central1
```

#### Google Cloud 密钥（重要！）

```env
GOOGLE_APPLICATION_CREDENTIALS_JSON=粘贴整个JSON文件内容
```

**如何获取 JSON 内容**：

1. **打开密钥文件**：
   ```bash
   # Windows
   notepad backend\credentials\google-cloud-key.json
   
   # Mac/Linux
   cat backend/credentials/google-cloud-key.json
   ```

2. **复制全部内容**（应该类似这样）：
   ```json
   {
     "type": "service_account",
     "project_id": "your-project-id",
     "private_key_id": "xxx...",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
     "client_email": "xxx@xxx.iam.gserviceaccount.com",
     ...
   }
   ```

3. **粘贴到 Railway**：
   - 变量名：`GOOGLE_APPLICATION_CREDENTIALS_JSON`
   - 值：粘贴整个 JSON（包括 `{` 和 `}`）

#### 代理配置（可选）

如果 Railway 服务器在中国访问 Google 有问题（通常不需要）：

```env
HTTP_PROXY=你的代理地址
HTTPS_PROXY=你的代理地址
```

### 第 5 步：部署

1. **点击 "Deploy"**
2. Railway 会自动：
   - 从 GitHub 拉取代码
   - 安装依赖 (`npm install`)
   - 启动服务 (`npm start`)
3. **等待 2-3 分钟**（首次部署较慢）
4. 查看部署日志，确认没有错误

### 第 6 步：获取后端 URL

部署成功后：

1. 在项目页面点击 **"Settings"**
2. 找到 **"Domains"** 部分
3. 点击 **"Generate Domain"**
4. 复制生成的 URL（类似：`https://ai-novel-assistant-production.up.railway.app`）

---

## ✅ 验证部署

### 测试后端 API

访问后端 URL，应该看到：

```json
{
  "message": "欢迎使用 AI 小说写作助手 API",
  "version": "1.0.0",
  "endpoints": {
    "auth": "/api/auth",
    "novels": "/api/novels",
    "cards": "/api/cards",
    "ai": "/api/ai"
  }
}
```

### 检查日志

在 Railway 项目页面：
- 点击 **"Logs"** 标签
- 应该看到：
  ```
  ✅ Google Cloud 密钥文件已写入
  ✅ GOOGLE_APPLICATION_CREDENTIALS 环境变量已设置
  🚀 服务器运行在端口 5000
  ```

---

## 🔄 自动部署

Railway 已配置自动部署，当你推送代码到 GitHub：

```bash
git add .
git commit -m "更新后端代码"
git push
```

Railway 会自动：
1. 检测到 GitHub 推送
2. 拉取最新代码
3. 重新构建和部署
4. 无缝切换到新版本

---

## 🌐 部署前端

### 方法 1：Vercel（推荐）

1. 访问：https://vercel.com/
2. 使用 GitHub 登录
3. 点击 **"New Project"**
4. 选择 **ai-novel-assistant**
5. 配置：
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. 添加环境变量：
   ```env
   VITE_API_BASE_URL=https://你的Railway后端URL
   ```
7. 点击 **"Deploy"**

### 方法 2：Railway（同服务器）

也可以在 Railway 同一个项目中添加前端服务：

1. 在项目中点击 **"New Service"**
2. 选择 **"GitHub Repo"**（同一个仓库）
3. 配置：
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Start Command**: `npx serve -s dist -l 3000`

---

## 💰 费用说明

### Railway 免费额度

- **$5 / 月**免费额度
- 用完后按使用量计费
- 小项目通常足够

### 计费方式

- **CPU 时间**：$0.000463 / CPU 秒
- **内存**：$0.000231 / GB 秒
- **网络**：$0.10 / GB（出站）

### 预估成本（轻度使用）

```
后端服务（24/7 运行）：~$3-5/月
前端（如果部署在 Railway）：~$1-2/月
总计：~$4-7/月（前端推荐用 Vercel 免费）
```

---

## 🐛 常见问题

### Q1: 部署失败，日志显示 "npm: not found"

**原因**：Root Directory 未设置

**解决**：Settings → Root Directory → 设置为 `backend`

### Q2: 启动失败，日志显示 "GOOGLE_APPLICATION_CREDENTIALS not found"

**原因**：环境变量未正确设置

**解决**：
1. 检查 `GOOGLE_APPLICATION_CREDENTIALS_JSON` 变量
2. 确保粘贴了完整的 JSON 内容
3. 重新部署

### Q3: API 返回 500 错误

**原因**：Google Cloud 权限问题

**解决**：
1. 检查服务账号是否有 "Vertex AI User" 角色
2. 检查 Project ID 是否正确
3. 查看 Railway 日志获取详细错误

### Q4: 想修改环境变量

1. Variables 标签 → 点击变量 → 修改
2. Railway 会自动重新部署

### Q5: 如何查看实时日志？

1. 项目页面 → Logs 标签
2. 可以看到所有 console.log 输出
3. 支持实时刷新

### Q6: 部署后访问很慢

**Railway 服务器位置**：美国

**解决方案**：
- 前端部署在 Vercel（全球 CDN）
- 或者添加 Cloudflare CDN

### Q7: 如何回滚到之前版本？

1. Deployments 标签
2. 找到之前的部署
3. 点击 "Redeploy"

---

## 📊 监控和优化

### 查看资源使用

1. **Usage** 标签
2. 查看 CPU、内存、网络使用
3. 预估费用

### 优化建议

1. **减少日志输出**（生产环境）
2. **使用环境变量控制日志级别**
3. **定期清理未使用的服务**

---

## 🔐 安全建议

### 1. 保护环境变量

- ✅ 不要在代码中硬编码密钥
- ✅ 使用 Railway 的 Variables 功能
- ✅ 定期更换 JWT_SECRET

### 2. API 访问控制

在后端添加速率限制：

```bash
cd backend
npm install express-rate-limit
```

### 3. CORS 配置

编辑 `backend/server.js`：

```javascript
app.use(cors({
  origin: 'https://你的前端域名.vercel.app',
  credentials: true
}))
```

---

## 📝 完整部署检查清单

### Railway 后端

- [ ] 注册 Railway 账号
- [ ] 关联 GitHub 仓库
- [ ] 设置 Root Directory 为 `backend`
- [ ] 添加所有环境变量
- [ ] 粘贴 Google Cloud JSON 密钥
- [ ] 部署成功
- [ ] 生成域名
- [ ] 测试 API 访问

### Vercel 前端

- [ ] 注册 Vercel 账号
- [ ] 关联 GitHub 仓库
- [ ] 设置 Root Directory 为 `frontend`
- [ ] 添加 VITE_API_BASE_URL 环境变量
- [ ] 部署成功
- [ ] 测试网页访问
- [ ] 测试 AI 功能

---

## 🎉 完成！

现在你的 AI 小说写作助手已经部署完成：

- **后端 API**：https://xxx.railway.app
- **前端网页**：https://xxx.vercel.app

用户可以访问前端网页，使用 AI 写作功能！

---

## 📞 需要帮助？

如果遇到问题：

1. 查看 Railway 日志
2. 检查环境变量配置
3. 参考本文档的常见问题
4. 提交 GitHub Issue

---

**祝部署顺利！🚀**

