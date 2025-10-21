# AI 小说助手 - 停止所有服务

Write-Host "⏹️  停止 AI 小说助手..." -ForegroundColor Yellow
Write-Host ""

pm2 stop all

Write-Host ""
Write-Host "✅ 所有服务已停止！" -ForegroundColor Green
Write-Host ""

pm2 status


