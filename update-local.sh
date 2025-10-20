#!/bin/bash

#============================================
# 本地修改后的服务器更新脚本
# 用于重启服务，无需 Git 操作
#============================================

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}🔄 更新服务${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

PROJECT_DIR="/www/wwwroot/ai-novel-assistant"

# 检查是否有前端代码修改
if [ -n "$(find $PROJECT_DIR/frontend/src -newer $PROJECT_DIR/frontend/dist -type f 2>/dev/null)" ]; then
    echo -e "${YELLOW}⚙️  检测到前端代码修改，重新构建...${NC}"
    cd "$PROJECT_DIR/frontend"
    npm run build
    echo -e "${GREEN}✅ 前端构建完成${NC}"
else
    echo -e "${GREEN}✅ 前端无需重新构建${NC}"
fi

# 重启后端
echo ""
echo -e "${YELLOW}⚙️  重启后端服务...${NC}"
pm2 restart ai-novel-backend

sleep 2

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 更新完成！${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${CYAN}查看后端日志：${NC}pm2 logs ai-novel-backend"
echo ""

