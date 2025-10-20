# ============================================
# AI 小说助手 - 自动同步到服务器脚本
# 用途：在本地修改代码后，一键同步到阿里云服务器
# ============================================

param(
    [string]$ServerIP = "8.130.74.146",
    [string]$ServerUser = "root",
    [switch]$OnlyFrontend,
    [switch]$OnlyBackend,
    [switch]$Help
)

$ErrorActionPreference = "Stop"

# 显示帮助
if ($Help) {
    Write-Host @"

AI 小说助手 - 自动同步脚本
============================

用法：
    .\sync-to-server.ps1                    # 同步所有代码并重启服务
    .\sync-to-server.ps1 -OnlyFrontend      # 只同步前端
    .\sync-to-server.ps1 -OnlyBackend       # 只同步后端
    .\sync-to-server.ps1 -ServerIP <IP>     # 指定服务器 IP

示例：
    .\sync-to-server.ps1
    .\sync-to-server.ps1 -OnlyFrontend
    .\sync-to-server.ps1 -ServerIP 192.168.1.100

"@
    exit 0
}

Write-Host ""
Write-Host "╔═══════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║                                           ║" -ForegroundColor Magenta
Write-Host "║     🚀 AI 小说助手 - 自动同步工具 🚀      ║" -ForegroundColor Magenta
Write-Host "║                                           ║" -ForegroundColor Magenta
Write-Host "╚═══════════════════════════════════════════╝" -ForegroundColor Magenta
Write-Host ""

$RemotePath = "/www/wwwroot/ai-novel-assistant"
$LocalPath = Get-Location

Write-Host "📋 同步配置：" -ForegroundColor Cyan
Write-Host "   服务器：$ServerUser@$ServerIP" -ForegroundColor Yellow
Write-Host "   本地路径：$LocalPath" -ForegroundColor Yellow
Write-Host "   远程路径：$RemotePath" -ForegroundColor Yellow
Write-Host ""

# ============================================
# 同步前端
# ============================================

if (-not $OnlyBackend) {
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "📤 同步前端代码..." -ForegroundColor Blue
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host ""
    
    # 排除 node_modules 和 dist
    Write-Host "⚙️  上传前端代码（排除 node_modules）..." -ForegroundColor Yellow
    
    scp -r frontend/src "${ServerUser}@${ServerIP}:${RemotePath}/frontend/"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ 前端代码同步失败" -ForegroundColor Red
        exit 1
    }
    
    scp -r frontend/public "${ServerUser}@${ServerIP}:${RemotePath}/frontend/"
    scp frontend/index.html "${ServerUser}@${ServerIP}:${RemotePath}/frontend/"
    scp frontend/vite.config.js "${ServerUser}@${ServerIP}:${RemotePath}/frontend/"
    scp frontend/tailwind.config.js "${ServerUser}@${ServerIP}:${RemotePath}/frontend/"
    scp frontend/package.json "${ServerUser}@${ServerIP}:${RemotePath}/frontend/"
    
    Write-Host "✅ 前端代码上传完成" -ForegroundColor Green
    
    # 重新构建前端
    Write-Host ""
    Write-Host "⚙️  重新构建前端..." -ForegroundColor Yellow
    ssh "${ServerUser}@${ServerIP}" "cd ${RemotePath}/frontend && npm run build"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ 前端构建失败" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ 前端构建完成" -ForegroundColor Green
}

# ============================================
# 同步后端
# ============================================

if (-not $OnlyFrontend) {
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "📤 同步后端代码..." -ForegroundColor Blue
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "⚙️  上传后端代码（排除 node_modules）..." -ForegroundColor Yellow
    
    scp -r backend/config "${ServerUser}@${ServerIP}:${RemotePath}/backend/"
    scp -r backend/database "${ServerUser}@${ServerIP}:${RemotePath}/backend/"
    scp -r backend/routes "${ServerUser}@${ServerIP}:${RemotePath}/backend/"
    scp -r backend/services "${ServerUser}@${ServerIP}:${RemotePath}/backend/"
    scp backend/server.js "${ServerUser}@${ServerIP}:${RemotePath}/backend/"
    scp backend/package.json "${ServerUser}@${ServerIP}:${RemotePath}/backend/"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ 后端代码同步失败" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ 后端代码上传完成" -ForegroundColor Green
    
    # 重启后端服务
    Write-Host ""
    Write-Host "⚙️  重启后端服务..." -ForegroundColor Yellow
    ssh "${ServerUser}@${ServerIP}" "cd ${RemotePath}/backend && pm2 restart ai-novel-backend"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ 后端重启失败" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ 后端重启完成" -ForegroundColor Green
}

# ============================================
# 完成
# ============================================

Write-Host ""
Write-Host "╔═══════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║                                           ║" -ForegroundColor Magenta
Write-Host "║         🎉 同步完成！🎉                   ║" -ForegroundColor Magenta
Write-Host "║                                           ║" -ForegroundColor Magenta
Write-Host "╚═══════════════════════════════════════════╝" -ForegroundColor Magenta
Write-Host ""

Write-Host "📋 查看服务状态：" -ForegroundColor Cyan
ssh "${ServerUser}@${ServerIP}" "pm2 status"

Write-Host ""
Write-Host "💡 提示：" -ForegroundColor Yellow
Write-Host "   前端访问：http://${ServerIP}" -ForegroundColor Cyan
Write-Host "   后端日志：ssh ${ServerUser}@${ServerIP} 'pm2 logs ai-novel-backend'" -ForegroundColor Cyan
Write-Host ""

