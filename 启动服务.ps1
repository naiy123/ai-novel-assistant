# AI 小说助手 - 启动所有服务

Write-Host "🚀 启动 AI 小说助手..." -ForegroundColor Green
Write-Host ""

# 检查 PM2 是否安装
try {
    $pm2Version = pm2 --version
    Write-Host "✅ PM2 已安装 (版本: $pm2Version)" -ForegroundColor Green
} catch {
    Write-Host "❌ PM2 未安装，正在安装..." -ForegroundColor Red
    npm install -g pm2
}

Write-Host ""
Write-Host "📦 启动后端服务..." -ForegroundColor Cyan
Set-Location "C:\Users\Administrator\ai-novel-assistant\ai-novel-assistant\backend"
pm2 start server.js --name "ai-novel-backend"

Write-Host ""
Write-Host "🌐 启动前端服务..." -ForegroundColor Cyan
Set-Location "C:\Users\Administrator\ai-novel-assistant\ai-novel-assistant\frontend"

# 检查是否已构建
if (!(Test-Path "dist")) {
    Write-Host "⚠️  前端未构建，正在构建..." -ForegroundColor Yellow
    npm run build
}

pm2 serve dist 80 --name "ai-novel-frontend" --spa

Write-Host ""
Write-Host "💾 保存 PM2 配置..." -ForegroundColor Cyan
pm2 save

Write-Host ""
Write-Host "✅ 所有服务已启动！" -ForegroundColor Green
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
pm2 status
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

# 获取公网 IP
try {
    $publicIP = Invoke-RestMethod -Uri "http://ifconfig.me/ip" -TimeoutSec 5
    Write-Host "🌐 访问地址：" -ForegroundColor Green
    Write-Host "   前端网站: http://$publicIP" -ForegroundColor White
    Write-Host "   后端 API: http://$publicIP:5000" -ForegroundColor White
} catch {
    Write-Host "⚠️  无法获取公网 IP，请手动检查" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📝 查看日志: pm2 logs" -ForegroundColor Cyan
Write-Host "📊 查看状态: pm2 status" -ForegroundColor Cyan
Write-Host ""


