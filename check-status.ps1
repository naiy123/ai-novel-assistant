# AI Novel Assistant - Check Status

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AI Novel Assistant - Service Status" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# PM2 Status
pm2 list

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Port Listening
Write-Host "Port Status:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  Port 80 (Frontend):" -ForegroundColor White
$port80 = netstat -ano | Select-String ":80 " | Select-String "LISTENING" | Select-Object -First 1
if ($port80) {
    Write-Host "    LISTENING" -ForegroundColor Green
} else {
    Write-Host "    NOT LISTENING" -ForegroundColor Red
}

Write-Host ""
Write-Host "  Port 5000 (Backend):" -ForegroundColor White
$port5000 = netstat -ano | Select-String ":5000" | Select-String "LISTENING" | Select-Object -First 1
if ($port5000) {
    Write-Host "    LISTENING" -ForegroundColor Green
} else {
    Write-Host "    NOT LISTENING" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Access URLs
Write-Host "Access URLs:" -ForegroundColor Yellow
Write-Host ""

try {
    $publicIP = Invoke-RestMethod -Uri "http://ifconfig.me/ip" -TimeoutSec 5
    Write-Host "  Public IP: $publicIP" -ForegroundColor White
    Write-Host ""
    Write-Host "  Frontend: http://$publicIP" -ForegroundColor Green
    Write-Host "  Backend:  http://$publicIP:5000" -ForegroundColor Green
} catch {
    Write-Host "  Unable to get public IP" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Recent Logs
Write-Host "Recent Logs (last 5 lines):" -ForegroundColor Yellow
Write-Host ""
pm2 logs --lines 5 --nostream

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Commands:" -ForegroundColor Yellow
Write-Host "  View logs:    pm2 logs" -ForegroundColor White
Write-Host "  Restart all:  pm2 restart all" -ForegroundColor White
Write-Host "  Stop all:     pm2 stop all" -ForegroundColor White
Write-Host ""


