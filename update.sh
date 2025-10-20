#!/bin/bash

#============================================
# AI 小说助手 - 服务器端更新脚本
# 用途：在服务器上运行，从 GitHub 拉取最新代码并更新
#============================================

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

clear
echo ""
echo -e "${PURPLE}╔═══════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                                           ║${NC}"
echo -e "${PURPLE}║     🔄 AI 小说助手 - 更新脚本 🔄         ║${NC}"
echo -e "${PURPLE}║                                           ║${NC}"
echo -e "${PURPLE}╚═══════════════════════════════════════════╝${NC}"
echo ""

PROJECT_DIR="/www/wwwroot/ai-novel-assistant"

if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}❌ 项目目录不存在：$PROJECT_DIR${NC}"
    exit 1
fi

cd "$PROJECT_DIR"

#============================================
# 第 1 步：备份当前版本
#============================================

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}💾 第 1 步：备份当前版本${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

BACKUP_DIR="/www/backup/ai-novel-assistant-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo -e "${YELLOW}⚙️  备份后端...${NC}"
cp -r backend "$BACKUP_DIR/"

echo -e "${YELLOW}⚙️  备份前端...${NC}"
cp -r frontend "$BACKUP_DIR/"

echo -e "${GREEN}✅ 备份完成：$BACKUP_DIR${NC}"

#============================================
# 第 2 步：拉取最新代码
#============================================

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📥 第 2 步：拉取最新代码${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${YELLOW}⚙️  从 GitHub 拉取...${NC}"
git pull origin main

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 代码拉取失败${NC}"
    echo -e "${YELLOW}💡 恢复备份：cp -r $BACKUP_DIR/* $PROJECT_DIR/${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 代码拉取完成${NC}"

#============================================
# 第 3 步：更新后端依赖
#============================================

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📦 第 3 步：更新后端依赖${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

cd "$PROJECT_DIR/backend"

echo -e "${YELLOW}⚙️  安装后端依赖...${NC}"
npm install --production

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  后端依赖安装失败，继续...${NC}"
fi

echo -e "${GREEN}✅ 后端依赖更新完成${NC}"

#============================================
# 第 4 步：更新前端依赖并构建
#============================================

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🏗️  第 4 步：更新前端依赖并构建${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

cd "$PROJECT_DIR/frontend"

echo -e "${YELLOW}⚙️  安装前端依赖...${NC}"
npm install

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  前端依赖安装失败，继续...${NC}"
fi

echo ""
echo -e "${YELLOW}⚙️  构建前端...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 前端构建失败${NC}"
    echo -e "${YELLOW}💡 恢复备份：cp -r $BACKUP_DIR/* $PROJECT_DIR/${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 前端构建完成${NC}"

#============================================
# 第 5 步：重启服务
#============================================

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔄 第 5 步：重启服务${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${YELLOW}⚙️  重启后端服务...${NC}"
pm2 restart ai-novel-backend

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 后端重启失败${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 后端重启完成${NC}"

#============================================
# 完成
#============================================

echo ""
echo -e "${PURPLE}╔═══════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                                           ║${NC}"
echo -e "${PURPLE}║         🎉 更新完成！🎉                   ║${NC}"
echo -e "${PURPLE}║                                           ║${NC}"
echo -e "${PURPLE}╚═══════════════════════════════════════════╝${NC}"
echo ""

echo -e "${CYAN}📋 服务状态：${NC}"
pm2 status

echo ""
echo -e "${CYAN}💡 查看日志：${NC}"
echo -e "   ${YELLOW}pm2 logs ai-novel-backend${NC}"
echo ""
