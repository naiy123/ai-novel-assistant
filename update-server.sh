#!/bin/bash

#============================================
# AI 小说写作助手 - 服务器更新脚本
# 用于从 GitHub 拉取最新代码并重启服务
#============================================

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

clear
echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔄 开始更新服务器代码${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

PROJECT_DIR="/www/wwwroot/ai-novel-assistant"

# 检查项目目录
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}❌ 项目目录不存在${NC}"
    exit 1
fi

cd "$PROJECT_DIR"

#============================================
# 第 1 步：拉取最新代码
#============================================

echo -e "${YELLOW}⚙️  从 GitHub 拉取最新代码...${NC}"
git pull origin main

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 代码拉取失败${NC}"
    echo -e "${YELLOW}可能的原因：${NC}"
    echo "  1. 服务器上有未提交的修改"
    echo "  2. Git 冲突"
    echo ""
    echo -e "${CYAN}解决方法：${NC}"
    echo "  git reset --hard origin/main  # 强制覆盖本地修改"
    exit 1
fi

echo -e "${GREEN}✅ 代码拉取成功${NC}"

#============================================
# 第 2 步：更新后端依赖（如果 package.json 有变化）
#============================================

echo ""
echo -e "${YELLOW}⚙️  检查后端依赖...${NC}"
cd "$PROJECT_DIR/backend"

if git diff --name-only HEAD@{1} HEAD | grep -q "package.json"; then
    echo -e "${YELLOW}⚙️  package.json 有变化，更新依赖...${NC}"
    npm install --production
    echo -e "${GREEN}✅ 后端依赖更新完成${NC}"
else
    echo -e "${GREEN}✅ 无需更新后端依赖${NC}"
fi

#============================================
# 第 3 步：更新前端依赖并重新构建（如果有变化）
#============================================

echo ""
cd "$PROJECT_DIR/frontend"

NEED_REBUILD=false

# 检查是否有前端文件变化
if git diff --name-only HEAD@{1} HEAD | grep -E "^frontend/"; then
    NEED_REBUILD=true
    echo -e "${YELLOW}⚙️  检测到前端代码变化${NC}"
fi

# 检查 package.json 变化
if git diff --name-only HEAD@{1} HEAD | grep -q "frontend/package.json"; then
    echo -e "${YELLOW}⚙️  package.json 有变化，更新依赖...${NC}"
    npm install
    NEED_REBUILD=true
    echo -e "${GREEN}✅ 前端依赖更新完成${NC}"
fi

# 重新构建前端
if [ "$NEED_REBUILD" = true ]; then
    echo -e "${YELLOW}⚙️  重新构建前端...${NC}"
    npm run build
    echo -e "${GREEN}✅ 前端构建完成${NC}"
else
    echo -e "${GREEN}✅ 前端无变化，跳过构建${NC}"
fi

#============================================
# 第 4 步：重启后端服务
#============================================

echo ""
echo -e "${YELLOW}⚙️  重启后端服务...${NC}"
pm2 restart ai-novel-backend

sleep 2

# 检查服务状态
if pm2 describe ai-novel-backend | grep -q "online"; then
    echo -e "${GREEN}✅ 后端服务重启成功${NC}"
else
    echo -e "${RED}❌ 后端服务重启失败${NC}"
    echo -e "${YELLOW}查看日志：${NC}pm2 logs ai-novel-backend"
    exit 1
fi

#============================================
# 第 5 步：测试服务
#============================================

echo ""
echo -e "${YELLOW}⚙️  测试服务...${NC}"

sleep 3

if curl -s http://127.0.0.1:5000/ | grep -q "AI 小说写作助手"; then
    echo -e "${GREEN}✅ 后端 API 正常${NC}"
else
    echo -e "${YELLOW}⚠️  后端 API 可能还在启动中${NC}"
fi

if [ -f "$PROJECT_DIR/frontend/dist/index.html" ]; then
    echo -e "${GREEN}✅ 前端页面正常${NC}"
else
    echo -e "${YELLOW}⚠️  前端页面未找到${NC}"
fi

#============================================
# 完成
#============================================

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 更新完成！${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}查看服务状态：${NC}pm2 status"
echo -e "${CYAN}查看后端日志：${NC}pm2 logs ai-novel-backend"
echo ""





