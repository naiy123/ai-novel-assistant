# AI 小说助手 - 查看服务状态

Write-Host "📊 AI 小说助手 - 服务状态" -ForegroundColor Cyan
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

# PM2 状态
pm2 status

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

# 端口监听状态
Write-Host "🔌 端口监听状态：" -ForegroundColor Cyan
Write-Host ""
Write-Host "  80 端口 (前端):" -ForegroundColor White
netstat -ano | Select-String ":80 " | Select-String "LISTENING" | Select-Object -First 1

Write-Host "  5000 端口 (后端):" -ForegroundColor White
netstat -ano | Select-String ":5000" | Select-String "LISTENING" | Select-Object -First 1

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

# 获取公网 IP 和访问地址
Write-Host "🌐 访问信息：" -ForegroundColor Cyan
Write-Host ""

try {
    $publicIP = Invoke-RestMethod -Uri "http://ifconfig.me/ip" -TimeoutSec 5
    Write-Host "  公网 IP: $publicIP" -ForegroundColor White
    Write-Host ""
    Write-Host "  访问地址：" -ForegroundColor Green
    Write-Host "    • 前端网站: http://$publicIP" -ForegroundColor White
    Write-Host "    • 后端 API: http://$publicIP:5000" -ForegroundColor White
} catch {
    Write-Host "  ⚠️  无法获取公网 IP" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

# 最近的日志
Write-Host "📝 最近日志（最后 10 行）：" -ForegroundColor Cyan
Write-Host ""
pm2 logs --lines 10 --nostream

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "💡 提示：" -ForegroundColor Yellow
Write-Host "   • 查看完整日志: pm2 logs" -ForegroundColor White
Write-Host "   • 重启服务: .\重启服务.ps1" -ForegroundColor White
Write-Host "   • 停止服务: .\停止服务.ps1" -ForegroundColor White
Write-Host ""


