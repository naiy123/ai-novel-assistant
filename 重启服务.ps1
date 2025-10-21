# AI 小说助手 - 重启所有服务

Write-Host "🔄 重启 AI 小说助手..." -ForegroundColor Cyan
Write-Host ""

pm2 restart all

Write-Host ""
Write-Host "✅ 所有服务已重启！" -ForegroundColor Green
Write-Host ""

pm2 status
Write-Host ""
pm2 logs --lines 20 --nostream


