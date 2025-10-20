#!/bin/bash

#============================================
# 宝塔 WebHook 自动部署脚本
# 当 GitHub 收到 Push 时自动触发
#============================================

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

# 项目配置
PROJECT_DIR="/www/wwwroot/ai-novel-assistant"
LOG_FILE="/www/wwwroot/ai-novel-assistant/deploy.log"

# 记录日志
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

echo ""
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "🔔 WebHook 触发，开始自动部署..."
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd "$PROJECT_DIR" || exit 1

# 1. 拉取最新代码
log "📥 拉取最新代码..."
git fetch origin main
git reset --hard origin/main

if [ $? -ne 0 ]; then
    log "❌ Git pull 失败"
    exit 1
fi

log "✅ 代码更新成功"

# 2. 安装后端依赖
log "📦 安装后端依赖..."
cd "$PROJECT_DIR/backend"
npm install --production

if [ $? -ne 0 ]; then
    log "⚠️  后端依赖安装失败，继续部署..."
fi

# 3. 构建前端
log "🔨 构建前端..."
cd "$PROJECT_DIR/frontend"
npm install
npm run build

if [ $? -ne 0 ]; then
    log "❌ 前端构建失败"
    exit 1
fi

log "✅ 前端构建成功"

# 4. 重启后端服务
log "🔄 重启后端服务..."
pm2 restart ai-novel-backend

if [ $? -ne 0 ]; then
    log "❌ PM2 重启失败"
    exit 1
fi

log "✅ 服务重启成功"

# 5. 清理
log "🧹 清理临时文件..."
cd "$PROJECT_DIR"
find . -name "*.log" -type f -mtime +7 -delete
find . -name ".DS_Store" -delete

log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log "🎉 部署完成！"
log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 显示服务状态
pm2 list

exit 0

