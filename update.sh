#!/bin/bash

# 快速更新脚本 - 用于更新代码后重新部署

set -e

echo "🔄 更新 AI 小说写作助手..."
echo ""

# 拉取最新代码
echo "📥 拉取最新代码..."
git pull

# 重新构建前端（如果有变化）
if [ -n "$(git diff HEAD@{1} HEAD -- frontend/)" ]; then
    echo "🏗️  重新构建前端..."
    cd frontend
    npm install
    npm run build
    cd ..
fi

# 重启服务
echo "🔄 重启服务..."
docker-compose restart

echo ""
echo "✅ 更新完成！"
echo ""

# 显示日志
docker-compose logs --tail=50 backend

