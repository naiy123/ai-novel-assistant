# AI 小说写作助手 - 本地热更新脚本
# 在 Cursor 中修改代码后，运行此脚本自动部署到服务器

param(
    [string]$CommitMessage = "Update code from Cursor"
)

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🚀 开始热更新部署" -ForegroundColor Blue
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# 服务器配置
$SERVER_IP = "8.130.74.146"
$SERVER_USER = "root"

#============================================
# 第 1 步：提交代码到 Git
#============================================

Write-Host "⚙️  提交代码到本地 Git..." -ForegroundColor Yellow

git add .
git commit -m $CommitMessage

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 代码提交成功" -ForegroundColor Green
} else {
    Write-Host "⚠️  没有新的修改需要提交" -ForegroundColor Yellow
}

#============================================
# 第 2 步：推送到 GitHub
#============================================

Write-Host ""
Write-Host "⚙️  推送到 GitHub..." -ForegroundColor Yellow

git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 推送到 GitHub 成功" -ForegroundColor Green
} else {
    Write-Host "❌ 推送失败" -ForegroundColor Red
    exit 1
}

#============================================
# 第 3 步：SSH 到服务器执行更新
#============================================

Write-Host ""
Write-Host "⚙️  连接到服务器并执行更新..." -ForegroundColor Yellow
Write-Host ""

# 执行服务器更新脚本
ssh ${SERVER_USER}@${SERVER_IP} "bash /www/wwwroot/ai-novel-assistant/update-server.sh"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
    Write-Host "🎉 热更新完成！" -ForegroundColor Green
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
    Write-Host ""
    Write-Host "访问地址: http://$SERVER_IP" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ 服务器更新失败" -ForegroundColor Red
    Write-Host ""
    Write-Host "手动连接服务器查看日志:" -ForegroundColor Yellow
    Write-Host "  ssh ${SERVER_USER}@${SERVER_IP}" -ForegroundColor Cyan
    Write-Host "  pm2 logs ai-novel-backend" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

