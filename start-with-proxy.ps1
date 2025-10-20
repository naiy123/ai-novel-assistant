# AI 小说写作助手 - 带代理启动脚本（Windows PowerShell）
# 用于在中国网络环境下启动应用

Write-Host ""
Write-Host "🚀 启动 AI 小说写作助手（带代理）" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host ""

# ===== 配置区域 =====
# 请修改为你的代理地址和端口
$PROXY_HOST = "127.0.0.1"
$PROXY_PORT = "7890"
# ====================

$PROXY_URL = "http://${PROXY_HOST}:${PROXY_PORT}"

Write-Host "⚙️  配置信息:" -ForegroundColor Cyan
Write-Host "  - 代理地址: $PROXY_URL" -ForegroundColor Yellow
Write-Host "  - 项目目录: $PWD" -ForegroundColor Yellow
Write-Host ""

# 检查代理是否可用
Write-Host "🔍 检查代理连接..." -ForegroundColor Cyan
try {
    $env:HTTP_PROXY = $PROXY_URL
    $env:HTTPS_PROXY = $PROXY_URL
    
    # 尝试通过代理访问 Google（超时 5 秒）
    $response = Invoke-WebRequest -Uri "https://www.google.com" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
    
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ 代理连接正常" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  警告：代理连接失败" -ForegroundColor Yellow
    Write-Host "   错误: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "请检查:" -ForegroundColor Yellow
    Write-Host "  1. 代理软件（Clash/V2Ray）是否已启动" -ForegroundColor White
    Write-Host "  2. 代理地址和端口是否正确: $PROXY_URL" -ForegroundColor White
    Write-Host "  3. 在浏览器中测试能否访问 Google" -ForegroundColor White
    Write-Host ""
    
    $continue = Read-Host "是否继续启动？(y/n)"
    if ($continue -ne "y") {
        Write-Host "已取消启动" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host ""

# 启动后端
Write-Host "📦 启动后端服务..." -ForegroundColor Cyan
$backendArgs = @(
    "-NoExit",
    "-Command",
    "cd '$PWD\backend'; `$env:HTTP_PROXY='$PROXY_URL'; `$env:HTTPS_PROXY='$PROXY_URL'; Write-Host '🔄 代理配置: $PROXY_URL' -ForegroundColor Yellow; Write-Host ''; npm run dev"
)
Start-Process powershell -ArgumentList $backendArgs

Start-Sleep -Seconds 3

# 启动前端
Write-Host "🎨 启动前端服务..." -ForegroundColor Cyan
$frontendArgs = @(
    "-NoExit",
    "-Command",
    "cd '$PWD\frontend'; npm run dev"
)
Start-Process powershell -ArgumentList $frontendArgs

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host "✅ 启动完成！" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host ""
Write-Host "📍 访问地址:" -ForegroundColor Cyan
Write-Host "  - 前端: " -NoNewline -ForegroundColor White
Write-Host "http://localhost:3000" -ForegroundColor Yellow
Write-Host "  - 后端: " -NoNewline -ForegroundColor White
Write-Host "http://localhost:5000" -ForegroundColor Yellow
Write-Host ""
Write-Host "💡 提示:" -ForegroundColor Cyan
Write-Host "  - 后端和前端将在新窗口中启动" -ForegroundColor White
Write-Host "  - 关闭新窗口即可停止服务" -ForegroundColor White
Write-Host "  - 后端日志将显示完整的 API 请求/响应" -ForegroundColor White
Write-Host "  - 代理配置已应用到后端" -ForegroundColor White
Write-Host ""
Write-Host "🔧 如需修改代理设置，请编辑此脚本顶部的配置区域" -ForegroundColor Gray
Write-Host ""

