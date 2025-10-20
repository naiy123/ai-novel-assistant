# AI 小说写作助手 - Railway 自动部署脚本
# 使用 Railway CLI 进行命令行部署

Write-Host ""
Write-Host "🚂 Railway 自动部署工具" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host ""

# 检查 Railway CLI 是否已安装
Write-Host "🔍 检查 Railway CLI..." -ForegroundColor Cyan
if (!(Get-Command railway -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Railway CLI 未安装" -ForegroundColor Red
    Write-Host ""
    Write-Host "请先安装 Railway CLI：" -ForegroundColor Yellow
    Write-Host "  npm install -g @railway/cli" -ForegroundColor White
    Write-Host ""
    Write-Host "或使用 Scoop：" -ForegroundColor Yellow
    Write-Host "  scoop install railway" -ForegroundColor White
    Write-Host ""
    exit 1
}
Write-Host "✅ Railway CLI 已安装" -ForegroundColor Green
Write-Host ""

# 检查是否已登录
Write-Host "🔐 检查登录状态..." -ForegroundColor Cyan
$loginCheck = railway whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  未登录 Railway" -ForegroundColor Yellow
    Write-Host "正在打开浏览器进行登录..." -ForegroundColor Cyan
    railway login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ 登录失败" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✅ 已登录 Railway" -ForegroundColor Green
Write-Host ""

# 进入后端目录
Write-Host "📂 进入后端目录..." -ForegroundColor Cyan
cd backend
if (!(Test-Path "server.js")) {
    Write-Host "❌ 未找到 server.js，请确保在项目根目录运行此脚本" -ForegroundColor Red
    exit 1
}
Write-Host "✅ 后端目录确认" -ForegroundColor Green
Write-Host ""

# 检查 Google Cloud 密钥文件
Write-Host "🔑 检查 Google Cloud 密钥..." -ForegroundColor Cyan
if (!(Test-Path "credentials\google-cloud-key.json")) {
    Write-Host "❌ 未找到 credentials\google-cloud-key.json" -ForegroundColor Red
    Write-Host ""
    Write-Host "请先下载 Google Cloud 服务账号密钥文件并放置到：" -ForegroundColor Yellow
    Write-Host "  backend\credentials\google-cloud-key.json" -ForegroundColor White
    Write-Host ""
    exit 1
}
Write-Host "✅ 密钥文件已找到" -ForegroundColor Green
Write-Host ""

# 初始化或链接项目
Write-Host "🚂 初始化 Railway 项目..." -ForegroundColor Cyan
Write-Host "选择操作：" -ForegroundColor Yellow
Write-Host "  1. 创建新项目" -ForegroundColor White
Write-Host "  2. 链接已有项目" -ForegroundColor White
$choice = Read-Host "请选择 (1/2)"

if ($choice -eq "1") {
    Write-Host "创建新项目..." -ForegroundColor Cyan
    railway init
} elseif ($choice -eq "2") {
    Write-Host "链接已有项目..." -ForegroundColor Cyan
    railway link
} else {
    Write-Host "❌ 无效选择" -ForegroundColor Red
    exit 1
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 项目初始化失败" -ForegroundColor Red
    exit 1
}
Write-Host "✅ 项目已配置" -ForegroundColor Green
Write-Host ""

# 配置环境变量
Write-Host "⚙️  配置环境变量..." -ForegroundColor Cyan
Write-Host ""

# 生成 JWT Secret
Write-Host "生成 JWT_SECRET..." -ForegroundColor Gray
$jwtSecret = node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
railway variables set PORT=5000 | Out-Null
railway variables set NODE_ENV=production | Out-Null
railway variables set JWT_SECRET="$jwtSecret" | Out-Null
Write-Host "✅ 基础配置完成" -ForegroundColor Green

# Google Cloud 配置
Write-Host ""
$projectId = Read-Host "请输入 Google Cloud Project ID"
railway variables set VERTEX_AI_PROJECT_ID="$projectId" | Out-Null
railway variables set VERTEX_AI_LOCATION="us-central1" | Out-Null
Write-Host "✅ Google Cloud 配置完成" -ForegroundColor Green

# 上传密钥
Write-Host ""
Write-Host "上传 Google Cloud 密钥..." -ForegroundColor Gray
$jsonContent = Get-Content credentials\google-cloud-key.json -Raw
railway variables set GOOGLE_APPLICATION_CREDENTIALS_JSON="$jsonContent" | Out-Null
Write-Host "✅ 密钥已上传" -ForegroundColor Green

Write-Host ""
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host "✅ 环境变量配置完成！" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host ""

# 部署
Write-Host "🚀 开始部署..." -ForegroundColor Cyan
Write-Host ""
railway up --detach

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 部署失败" -ForegroundColor Red
    Write-Host "查看日志: railway logs" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "✅ 部署已启动！" -ForegroundColor Green
Write-Host ""

# 生成域名
Write-Host "🌐 生成公开访问域名..." -ForegroundColor Cyan
railway domain

Write-Host ""
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host "🎉 部署完成！" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host ""

Write-Host "📝 常用命令：" -ForegroundColor Cyan
Write-Host "  railway logs        # 查看实时日志" -ForegroundColor White
Write-Host "  railway status      # 查看服务状态" -ForegroundColor White
Write-Host "  railway open        # 打开 Railway 仪表板" -ForegroundColor White
Write-Host "  railway variables   # 查看环境变量" -ForegroundColor White
Write-Host ""

Write-Host "🔍 正在获取服务状态..." -ForegroundColor Cyan
Start-Sleep -Seconds 2
railway status

Write-Host ""
Write-Host "✨ 提示：运行 'railway logs' 查看部署进度" -ForegroundColor Yellow
Write-Host ""

# 返回项目根目录
cd ..

