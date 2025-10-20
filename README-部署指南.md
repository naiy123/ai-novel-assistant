# 🚀 AI 小说写作助手 - 部署指南

## 📋 项目架构

```
┌─────────────────┐
│   中国用户      │
│   (浏览器)      │
└────────┬────────┘
         │ HTTP (无需代理)
         ↓
┌─────────────────┐
│   前端网页      │  ← 可部署在中国（阿里云/腾讯云）
│   React + Vite  │     用户访问无障碍
└────────┬────────┘
         │ HTTP API
         ↓
┌─────────────────┐
│   后端服务器    │  ← 需要访问 Google API
│   Node.js       │     方案1: 海外服务器（推荐）
└────────┬────────┘     方案2: 国内服务器 + HTTP代理
         │ HTTPS (需要代理/海外)
         ↓
┌─────────────────┐
│ Google Vertex AI│  ← 在中国被墙
└─────────────────┘
```

### 核心要点

1. **前端**：普通网页，可以部署在中国任何地方
2. **后端**：需要能访问 Google Vertex AI API
3. **代理只在后端**：用户不需要代理，只有后端服务器需要

---

## 🎯 推荐部署方案

### 方案 A：前后端分离部署（推荐生产环境）⭐⭐⭐⭐⭐

```
前端：阿里云 OSS / 腾讯云 COS（中国）
后端：AWS / Google Cloud（美国）
```

**优点：**
- ✅ 中国用户访问前端速度快
- ✅ 后端无需代理，直接访问 Google API
- ✅ 稳定可靠

**成本：**
- 前端：¥5-20/月（静态托管）
- 后端：¥100-200/月（海外 VPS）
- 总计：¥105-220/月

**适合：正式生产环境、多用户使用**

### 方案 B：全部署在海外（简单）⭐⭐⭐⭐

```
前端 + 后端：同一台海外服务器
```

**优点：**
- ✅ 部署简单，一台服务器搞定
- ✅ 无需代理
- ✅ 维护方便

**缺点：**
- ❌ 中国用户访问前端稍慢（可接受）

**成本：**
- ¥100-200/月（一台海外 VPS）

**适合：小团队、快速上线**

### 方案 C：国内服务器 + HTTP 代理⭐⭐⭐

```
前端 + 后端：国内服务器（阿里云/腾讯云）
后端 → HTTP 代理 → Google API
```

**优点：**
- ✅ 中国用户访问速度快
- ✅ 相对便宜

**缺点：**
- ❌ 需要维护代理
- ❌ 代理稳定性问题

**成本：**
- 服务器：¥50-100/月
- 商业代理：¥30-50/月
- 总计：¥80-150/月

**适合：预算有限、技术能力强**

---

## 🚀 快速部署（三步）

### 步骤 1：准备 Google Cloud

1. 创建 Google Cloud 项目
2. 启用 Vertex AI API
3. 创建服务账号并下载 JSON 密钥
4. 授予 "Vertex AI User" 角色

详见：[Google Cloud 配置](#google-cloud-配置)

### 步骤 2：部署后端

#### 选项 A：海外服务器（推荐）

```bash
# SSH 连接到服务器
ssh root@your-server-ip

# 安装 Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 上传代码（或 git clone）
cd /var/www
# 上传项目文件

# 安装依赖
cd ai-novel-assistant/backend
npm install

# 配置环境变量
nano .env

# 添加以下内容：
# GOOGLE_APPLICATION_CREDENTIALS=backend/credentials/google-cloud-key.json
# VERTEX_AI_PROJECT_ID=your-project-id
# PORT=5000

# 上传 Google Cloud 密钥文件到 backend/credentials/google-cloud-key.json

# 使用 PM2 启动
npm install -g pm2
pm2 start server.js --name ai-novel-backend
pm2 save
pm2 startup
```

#### 选项 B：国内服务器 + 代理

```bash
# 在 .env 中额外添加：
HTTP_PROXY=http://your-proxy-server:port
HTTPS_PROXY=http://your-proxy-server:port

# 其他步骤同上
```

### 步骤 3：部署前端

#### 选项 A：静态托管（推荐）

```bash
# 本地构建前端
cd frontend
npm install
npm run build

# 上传 dist 目录到：
# - 阿里云 OSS
# - 腾讯云 COS
# - Vercel
# - Netlify
```

#### 选项 B：同服务器部署

```bash
# 在后端服务器上
cd frontend
npm install
npm run build

# 使用 nginx 提供静态文件
sudo apt install nginx

# 配置 nginx（见下方）
```

---

## 🔧 Nginx 配置

### 前后端同服务器

创建 `/etc/nginx/sites-available/ai-novel-assistant`：

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 你的域名

    # 前端静态文件
    location / {
        root /var/www/ai-novel-assistant/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # 后端 API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
        
        # AI 生成可能需要较长时间
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
    }
}
```

启用配置：

```bash
sudo ln -s /etc/nginx/sites-available/ai-novel-assistant /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 前端在 CDN，后端在海外

前端配置 API 地址（`frontend/.env.production`）：

```env
VITE_API_BASE_URL=https://api.your-domain.com
```

修改 `frontend/vite.config.js`：

```javascript
export default {
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
}
```

---

## 📋 环境变量配置

### backend/.env

```env
# Google Cloud 配置
GOOGLE_APPLICATION_CREDENTIALS=backend/credentials/google-cloud-key.json
VERTEX_AI_PROJECT_ID=your-project-id
VERTEX_AI_LOCATION=us-central1

# 服务器配置
PORT=5000
NODE_ENV=production

# JWT 密钥
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# ===== 仅国内服务器需要 =====
# HTTP 代理（如果后端在国内）
# HTTP_PROXY=http://proxy-server:port
# HTTPS_PROXY=http://proxy-server:port
```

### frontend/.env.production

```env
# 生产环境 API 地址
VITE_API_BASE_URL=https://api.your-domain.com

# 或者如果前后端同服务器，使用相对路径
# VITE_API_BASE_URL=
```

---

## 🧪 测试部署

### 1. 测试后端

```bash
# 测试 API 是否可访问
curl http://your-server:5000/api/health

# 测试 Vertex AI 配置
node backend/test-vertex-ai.js
```

### 2. 测试前端

访问：`http://your-domain.com`

登录测试账号：
- 用户名：`test`
- 密码：`123456`

### 3. 测试 AI 功能

1. 创建小说
2. 打开章节编辑器
3. 点击 "🤖 AI 写作"
4. 输入剧情大纲并生成

---

## 🔒 安全配置（重要）

### 1. 配置 HTTPS（必需）

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取 SSL 证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

### 2. 配置防火墙

```bash
# 只开放必要端口
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 22/tcp    # SSH
sudo ufw enable
```

### 3. 修改默认密码

在生产环境，删除测试账号或修改密码。

编辑 `backend/database/memoryDB.js` 或使用真实数据库。

---

## 📊 服务器推荐

### 海外 VPS（后端）

| 供应商 | 位置 | 配置 | 价格/月 | 推荐度 |
|--------|------|------|---------|--------|
| **Google Cloud** | us-central1 | 1vCPU 2GB | $10-15 | ⭐⭐⭐⭐⭐ |
| **AWS Lightsail** | 美国东部 | 1vCPU 2GB | $10 | ⭐⭐⭐⭐⭐ |
| **DigitalOcean** | 旧金山 | 1vCPU 2GB | $12 | ⭐⭐⭐⭐ |
| **Vultr** | 洛杉矶 | 1vCPU 2GB | $12 | ⭐⭐⭐⭐ |

**推荐 Google Cloud**：与 Vertex AI 同平台，速度最快，首年有 $300 赠金。

### 国内 CDN（前端）

| 供应商 | 服务 | 价格/月 | 推荐度 |
|--------|------|---------|--------|
| **阿里云** | OSS + CDN | ¥5-20 | ⭐⭐⭐⭐⭐ |
| **腾讯云** | COS + CDN | ¥5-20 | ⭐⭐⭐⭐⭐ |
| **七牛云** | 对象存储 + CDN | ¥5-15 | ⭐⭐⭐⭐ |

---

## 🔧 本地开发（Windows）

### 快速启动

```powershell
# 1. 安装依赖
cd backend
npm install
cd ..\frontend
npm install

# 2. 配置后端环境变量
# 编辑 backend\.env

# 3. 启动
# 终端 1：后端
cd backend
npm run dev

# 终端 2：前端
cd frontend
npm run dev
```

### 如果需要测试 AI（本地）

```powershell
# 设置代理（如果在中国）
$env:HTTP_PROXY="http://127.0.0.1:7890"
$env:HTTPS_PROXY="http://127.0.0.1:7890"

# 启动后端
cd backend
npm run dev
```

或使用启动脚本：

```powershell
.\start-with-proxy.ps1
```

---

## 🐛 常见问题

### Q1: 中国用户能访问吗？

**能！** 只要前端部署在中国或使用 CDN，用户访问速度很快。

### Q2: 后端必须在海外吗？

**不是必须。** 有两种方案：
1. 海外服务器（推荐，无需代理）
2. 国内服务器 + HTTP 代理

### Q3: 前端和后端必须在一起吗？

**不是。** 可以分开部署：
- 前端：阿里云 OSS（中国，快）
- 后端：AWS（海外，稳定）

### Q4: 代理在哪里配置？

**只在后端配置！**

编辑 `backend/.env`：
```env
HTTP_PROXY=http://your-proxy:port
HTTPS_PROXY=http://your-proxy:port
```

用户和前端都不需要代理。

### Q5: 成本大概多少？

**最低配置：**
- 海外 VPS：¥70/月
- 域名：¥50/年
- 总计：约 ¥75/月

**推荐配置：**
- 前端 CDN：¥10/月
- 后端 VPS：¥100/月
- 总计：约 ¥110/月

### Q6: 数据存在哪里？

当前使用**内存数据库**（重启丢失）。

生产环境建议：
- SQLite（小型）
- PostgreSQL（中型）
- MongoDB（大型）

---

## 📚 Google Cloud 配置

### 1. 创建项目

1. 访问 https://console.cloud.google.com
2. 点击项目选择器 → 新建项目
3. 输入项目名称（如 `ai-novel-assistant`）
4. 点击"创建"

### 2. 启用 Vertex AI API

1. 导航到"API 和服务" → "库"
2. 搜索 "Vertex AI API"
3. 点击"启用"

### 3. 创建服务账号

1. 导航到"IAM 和管理" → "服务账号"
2. 点击"创建服务账号"
3. 输入名称（如 `ai-novel-writer`）
4. 点击"创建并继续"
5. 选择角色："Vertex AI User"
6. 点击"完成"

### 4. 下载密钥

1. 点击创建的服务账号
2. 转到"密钥"标签
3. 点击"添加密钥" → "创建新密钥"
4. 选择"JSON"
5. 保存文件到 `backend/credentials/google-cloud-key.json`

---

## 📖 相关文档

- `Google-Cloud-配置指南.md` - Google Cloud 详细配置
- `使用指南.md` - 应用功能使用
- `AI功能使用指南.md` - AI 功能详解

---

## 💡 部署建议

### 小团队（10人以下）

```
前端：Vercel（免费）或阿里云 OSS
后端：Google Cloud Compute Engine (e2-micro)
成本：¥100/月左右
```

### 中型团队（10-100人）

```
前端：阿里云 OSS + CDN
后端：Google Cloud (e2-small) 或 AWS
数据库：PostgreSQL (云数据库)
成本：¥300-500/月
```

### 大型团队（100+人）

```
前端：多地域 CDN
后端：负载均衡 + 多实例
数据库：主从复制
缓存：Redis
成本：¥1000+/月
```

---

## ✅ 部署检查清单

### 部署前

- [ ] Google Cloud 项目已创建
- [ ] Vertex AI API 已启用
- [ ] 服务账号密钥已下载
- [ ] 域名已购买（可选）
- [ ] 服务器已准备

### 后端部署

- [ ] Node.js 18+ 已安装
- [ ] 代码已上传
- [ ] 依赖已安装 (`npm install`)
- [ ] `.env` 文件已配置
- [ ] Google Cloud 密钥文件已上传
- [ ] PM2 已配置
- [ ] 防火墙已配置
- [ ] API 测试通过

### 前端部署

- [ ] 前端已构建 (`npm run build`)
- [ ] 静态文件已上传
- [ ] Nginx 已配置（如需要）
- [ ] HTTPS 已配置
- [ ] 域名已解析

### 测试

- [ ] 前端可访问
- [ ] 登录功能正常
- [ ] AI 生成功能正常
- [ ] 后端日志正常

---

## 🎉 完成！

部署完成后，你的用户就可以：

1. 访问网页（无需代理）
2. 注册/登录
3. 创建小说和章节
4. 使用 AI 辅助写作

所有 Google API 调用在后端完成，用户无感知！

---

**如有问题，请参考文档或联系支持。**

