# 🚂 Railway CLI 命令行部署

通过命令行部署，无需打开网页！

## 📦 安装 Railway CLI

### Windows (PowerShell)

```powershell
# 使用 npm 安装
npm install -g @railway/cli

# 或使用 Scoop
scoop install railway
```

### Mac/Linux

```bash
# 使用 npm 安装
npm install -g @railway/cli

# 或使用 Homebrew (Mac)
brew install railway
```

---

## 🚀 部署步骤

### 第 1 步：登录 Railway

```powershell
railway login
```

这会打开浏览器进行一次性授权（只需要授权一次）。

### 第 2 步：初始化项目

```powershell
# 进入后端目录
cd backend

# 初始化 Railway 项目
railway init
```

选择：
- Create new project
- 输入项目名：`ai-novel-assistant`

### 第 3 步：关联 GitHub（可选）

```powershell
railway link
```

选择你的 GitHub 仓库。

### 第 4 步：添加环境变量

```powershell
# 设置环境变量
railway variables set PORT=5000
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=你的随机密钥
railway variables set VERTEX_AI_PROJECT_ID=你的项目ID
railway variables set VERTEX_AI_LOCATION=us-central1

# Google Cloud 密钥（从文件读取）
railway variables set GOOGLE_APPLICATION_CREDENTIALS_JSON="$(cat credentials/google-cloud-key.json)"
```

**Windows PowerShell 版本**：

```powershell
# 基础变量
railway variables set PORT=5000
railway variables set NODE_ENV=production
railway variables set JWT_SECRET="生成的随机密钥"
railway variables set VERTEX_AI_PROJECT_ID="你的项目ID"
railway variables set VERTEX_AI_LOCATION=us-central1

# Google Cloud 密钥
$jsonContent = Get-Content credentials\google-cloud-key.json -Raw
railway variables set GOOGLE_APPLICATION_CREDENTIALS_JSON="$jsonContent"
```

### 第 5 步：部署

```powershell
# 部署当前代码
railway up

# 或者部署整个项目
railway up --detach
```

### 第 6 步：获取 URL

```powershell
# 生成公开访问域名
railway domain

# 查看服务信息
railway status
```

### 第 7 步：查看日志

```powershell
# 实时查看日志
railway logs

# 查看最近日志
railway logs -n 100
```

---

## 📋 常用命令

```powershell
# 查看所有项目
railway list

# 查看环境变量
railway variables

# 删除环境变量
railway variables delete VARIABLE_NAME

# 查看服务状态
railway status

# 打开 Railway 仪表板
railway open

# 连接到服务终端
railway shell
```

---

## 🔧 完整部署脚本

创建 `deploy-railway.ps1`：

```powershell
# Railway 自动部署脚本

Write-Host "🚂 开始部署到 Railway..." -ForegroundColor Green
Write-Host ""

# 检查 Railway CLI
if (!(Get-Command railway -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Railway CLI 未安装" -ForegroundColor Red
    Write-Host "请运行: npm install -g @railway/cli" -ForegroundColor Yellow
    exit 1
}

# 进入后端目录
cd backend

Write-Host "📦 设置环境变量..." -ForegroundColor Cyan

# 生成 JWT Secret
$jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})

# 设置基础变量
railway variables set PORT=5000
railway variables set NODE_ENV=production
railway variables set JWT_SECRET="$jwtSecret"

# 提示用户输入 Google Cloud 配置
$projectId = Read-Host "请输入 Google Cloud Project ID"
railway variables set VERTEX_AI_PROJECT_ID="$projectId"
railway variables set VERTEX_AI_LOCATION="us-central1"

# 读取 Google Cloud 密钥
if (Test-Path "credentials\google-cloud-key.json") {
    Write-Host "✅ 找到 Google Cloud 密钥文件" -ForegroundColor Green
    $jsonContent = Get-Content credentials\google-cloud-key.json -Raw
    railway variables set GOOGLE_APPLICATION_CREDENTIALS_JSON="$jsonContent"
} else {
    Write-Host "❌ 未找到 credentials\google-cloud-key.json" -ForegroundColor Red
    Write-Host "请先下载 Google Cloud 服务账号密钥" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🚀 开始部署..." -ForegroundColor Cyan
railway up --detach

Write-Host ""
Write-Host "🌐 生成域名..." -ForegroundColor Cyan
railway domain

Write-Host ""
Write-Host "✅ 部署完成！" -ForegroundColor Green
Write-Host "运行以下命令查看状态：" -ForegroundColor Yellow
Write-Host "  railway logs    # 查看日志" -ForegroundColor White
Write-Host "  railway status  # 查看状态" -ForegroundColor White
Write-Host "  railway open    # 打开仪表板" -ForegroundColor White
```

使用：

```powershell
.\deploy-railway.ps1
```

---

## 🐛 常见问题

### Q1: "railway: command not found"

**解决**：

```powershell
npm install -g @railway/cli
```

重启终端后再试。

### Q2: 登录失败

**解决**：

```powershell
# 清除缓存重新登录
railway logout
railway login
```

### Q3: 部署失败

**查看日志**：

```powershell
railway logs
```

根据错误信息调整。

---

## 📊 对比：CLI vs 网页

| 功能 | CLI | 网页 |
|------|-----|------|
| 部署速度 | ⚡ 快 | 🐢 慢 |
| 自动化 | ✅ 易于脚本化 | ❌ 需手动操作 |
| 环境变量 | ✅ 批量设置 | 🔨 逐个添加 |
| 日志查看 | ✅ 实时 | ⏳ 需刷新 |
| 学习曲线 | 📈 稍陡 | 📉 简单 |

---

## 🎯 推荐使用 CLI 的场景

- ✅ 自动化部署
- ✅ CI/CD 集成
- ✅ 快速迭代
- ✅ 批量管理环境变量
- ✅ 开发环境与生产同步

---

**使用 CLI 部署更快更高效！** 🚀

