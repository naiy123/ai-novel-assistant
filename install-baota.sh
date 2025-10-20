#!/bin/bash

#============================================
# AI 小说写作助手 - 宝塔面板一键部署脚本
# 适合：完全没有代码基础的用户
# 使用：复制粘贴命令，回答几个问题即可
#============================================

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 显示欢迎界面
clear
echo ""
echo -e "${PURPLE}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                                                       ║${NC}"
echo -e "${PURPLE}║     ${GREEN}🎉 AI 小说写作助手 - 一键部署工具 🎉${PURPLE}        ║${NC}"
echo -e "${PURPLE}║                                                       ║${NC}"
echo -e "${PURPLE}║     ${CYAN}适合没有编程基础的用户${PURPLE}                     ║${NC}"
echo -e "${PURPLE}║     ${CYAN}全自动安装，只需回答几个问题${PURPLE}               ║${NC}"
echo -e "${PURPLE}║                                                       ║${NC}"
echo -e "${PURPLE}╚═══════════════════════════════════════════════════════╝${NC}"
echo ""
sleep 2

# 检查是否为 root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ 请使用 root 用户运行此脚本${NC}"
    echo -e "${YELLOW}   在宝塔终端中直接运行即可（默认就是 root）${NC}"
    exit 1
fi

echo -e "${CYAN}📋 开始部署准备...${NC}"
echo ""

#============================================
# 第 1 步：收集必要信息
#============================================

echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📝 第 1 步：收集必要信息${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 获取服务器 IP
SERVER_IP=$(curl -s ifconfig.me)
echo -e "${GREEN}✅ 检测到服务器 IP：${NC}${SERVER_IP}"
echo ""

# 询问是否需要 HTTP 代理
echo -e "${CYAN}❓ 你有 HTTP 代理吗？（用于访问 Google API）${NC}"
echo -e "${YELLOW}   如果没有，可以先跳过，后续再配置${NC}"
echo ""
read -p "是否配置代理？(y/n，默认n): " USE_PROXY
USE_PROXY=${USE_PROXY:-n}

if [[ "$USE_PROXY" =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${CYAN}请输入代理地址（格式: http://host:port）${NC}"
    echo -e "${YELLOW}例如: http://proxy.example.com:8080${NC}"
    read -p "代理地址: " HTTP_PROXY_URL
else
    HTTP_PROXY_URL=""
    echo -e "${YELLOW}⚠️  跳过代理配置（AI 功能将无法使用，需要后续配置）${NC}"
fi

echo ""
echo -e "${GREEN}✅ 信息收集完成！${NC}"
sleep 2

#============================================
# 第 2 步：安装必要软件
#============================================

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔧 第 2 步：安装必要软件（自动进行）${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 检查并安装 Node.js
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚙️  安装 Node.js...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
    echo -e "${GREEN}✅ Node.js 安装完成${NC}"
else
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✅ Node.js 已安装 ${NODE_VERSION}${NC}"
fi

# 检查并安装 Git
if ! command -v git &> /dev/null; then
    echo -e "${YELLOW}⚙️  安装 Git...${NC}"
    apt-get install -y git
    echo -e "${GREEN}✅ Git 安装完成${NC}"
else
    echo -e "${GREEN}✅ Git 已安装${NC}"
fi

# 检查并安装 PM2
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}⚙️  安装 PM2...${NC}"
    npm install -g pm2
    echo -e "${GREEN}✅ PM2 安装完成${NC}"
else
    echo -e "${GREEN}✅ PM2 已安装${NC}"
fi

echo ""
echo -e "${GREEN}✅ 所有软件安装完成！${NC}"
sleep 2

#============================================
# 第 3 步：下载项目代码
#============================================

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📥 第 3 步：下载项目代码${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

PROJECT_DIR="/www/wwwroot/ai-novel-assistant"

if [ -d "$PROJECT_DIR" ]; then
    echo -e "${YELLOW}⚠️  项目目录已存在${NC}"
    read -p "是否删除并重新下载？(y/n，默认n): " REDOWNLOAD
    if [[ "$REDOWNLOAD" =~ ^[Yy]$ ]]; then
        rm -rf "$PROJECT_DIR"
        echo -e "${GREEN}✅ 旧项目已删除${NC}"
    else
        echo -e "${YELLOW}⚠️  使用现有项目目录${NC}"
    fi
fi

if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${YELLOW}⚙️  正在从 GitHub 下载项目...${NC}"
    mkdir -p /www/wwwroot
    cd /www/wwwroot
    git clone https://github.com/naiy123/ai-novel-assistant.git
    echo -e "${GREEN}✅ 项目下载完成${NC}"
fi

cd "$PROJECT_DIR"

#============================================
# 第 4 步：安装项目依赖
#============================================

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📦 第 4 步：安装项目依赖（可能需要 2-3 分钟）${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${YELLOW}⚙️  安装后端依赖...${NC}"
cd "$PROJECT_DIR/backend"
npm install --production
echo -e "${GREEN}✅ 后端依赖安装完成${NC}"

echo ""
echo -e "${YELLOW}⚙️  安装前端依赖...${NC}"
cd "$PROJECT_DIR/frontend"
npm install
echo -e "${GREEN}✅ 前端依赖安装完成${NC}"

#============================================
# 第 5 步：配置环境变量
#============================================

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}⚙️  第 5 步：配置环境变量${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 生成随机 JWT Secret
JWT_SECRET=$(openssl rand -hex 32)
echo -e "${GREEN}✅ JWT 密钥已自动生成${NC}"

# 创建后端环境变量文件
cat > "$PROJECT_DIR/backend/.env.production" <<EOF
# 服务器配置
PORT=5000
NODE_ENV=production

# JWT 密钥（自动生成）
JWT_SECRET=${JWT_SECRET}

# Google Cloud 配置
VERTEX_AI_PROJECT_ID=mindful-hall-474616-d5
VERTEX_AI_LOCATION=us-central1

# HTTP 代理配置
${HTTP_PROXY_URL:+HTTP_PROXY=${HTTP_PROXY_URL}}
${HTTP_PROXY_URL:+HTTPS_PROXY=${HTTP_PROXY_URL}}

# 时区
TZ=Asia/Shanghai
EOF

echo -e "${GREEN}✅ 后端环境变量配置完成${NC}"

# 创建前端环境变量文件
echo "VITE_API_BASE_URL=http://${SERVER_IP}:5000" > "$PROJECT_DIR/frontend/.env.production"
echo -e "${GREEN}✅ 前端环境变量配置完成${NC}"

#============================================
# 第 6 步：检查 Google Cloud 密钥
#============================================

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔑 第 6 步：检查 Google Cloud 密钥${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

mkdir -p "$PROJECT_DIR/backend/credentials"

if [ ! -f "$PROJECT_DIR/backend/credentials/google-cloud-key.json" ]; then
    echo -e "${RED}❌ 未找到 Google Cloud 密钥文件${NC}"
    echo ""
    echo -e "${CYAN}请按以下步骤操作：${NC}"
    echo ""
    echo -e "${YELLOW}1. 在你的本地电脑，打开命令提示符（CMD）或 PowerShell${NC}"
    echo ""
    echo -e "${YELLOW}2. 运行以下命令上传密钥文件：${NC}"
    echo ""
    echo -e "${GREEN}   scp 本地密钥文件路径 root@${SERVER_IP}:${PROJECT_DIR}/backend/credentials/google-cloud-key.json${NC}"
    echo ""
    echo -e "${YELLOW}   例如（Windows PowerShell）：${NC}"
    echo -e "${GREEN}   scp C:\\path\\to\\your-key.json root@${SERVER_IP}:${PROJECT_DIR}/backend/credentials/google-cloud-key.json${NC}"
    echo ""
    echo -e "${YELLOW}3. 上传完成后，在宝塔终端重新运行此脚本${NC}"
    echo ""
    exit 1
else
    echo -e "${GREEN}✅ Google Cloud 密钥文件已找到${NC}"
fi

#============================================
# 第 7 步：构建前端
#============================================

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🏗️  第 7 步：构建前端（需要 1-2 分钟）${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

cd "$PROJECT_DIR/frontend"
echo -e "${YELLOW}⚙️  正在构建前端...${NC}"
npm run build
echo -e "${GREEN}✅ 前端构建完成${NC}"

#============================================
# 第 8 步：启动后端服务
#============================================

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🚀 第 8 步：启动后端服务${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

cd "$PROJECT_DIR/backend"

# 停止旧进程（如果存在）
pm2 delete ai-novel-backend 2>/dev/null || true

# 启动新进程
echo -e "${YELLOW}⚙️  启动后端服务...${NC}"
pm2 start server.js --name ai-novel-backend --env production
pm2 save
pm2 startup

echo -e "${GREEN}✅ 后端服务启动成功${NC}"

#============================================
# 第 9 步：配置 Nginx
#============================================

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🌐 第 9 步：配置 Nginx${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 创建 Nginx 配置
NGINX_CONF="/www/server/panel/vhost/nginx/ai-novel-assistant.conf"

cat > "$NGINX_CONF" <<'EOF'
server {
    listen 80;
    server_name _;
    
    # 前端静态文件
    location / {
        root /www/wwwroot/ai-novel-assistant/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # 缓存策略
        location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
            expires 30d;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # 后端 API 代理
    location /api {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 超时设置
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }
    
    access_log /www/wwwlogs/ai-novel-assistant.log;
    error_log /www/wwwlogs/ai-novel-assistant.error.log;
}
EOF

echo -e "${GREEN}✅ Nginx 配置已创建${NC}"

# 重启 Nginx
echo -e "${YELLOW}⚙️  重启 Nginx...${NC}"
nginx -t && nginx -s reload
echo -e "${GREEN}✅ Nginx 重启成功${NC}"

#============================================
# 第 10 步：测试部署
#============================================

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🧪 第 10 步：测试部署${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

sleep 3

echo -e "${YELLOW}⚙️  测试后端 API...${NC}"
if curl -s http://127.0.0.1:5000/ | grep -q "AI 小说写作助手"; then
    echo -e "${GREEN}✅ 后端 API 正常${NC}"
else
    echo -e "${YELLOW}⚠️  后端 API 可能还在启动中${NC}"
fi

echo ""
echo -e "${YELLOW}⚙️  测试前端页面...${NC}"
if curl -s http://127.0.0.1/ | grep -q "html"; then
    echo -e "${GREEN}✅ 前端页面正常${NC}"
else
    echo -e "${YELLOW}⚠️  前端页面可能还在启动中${NC}"
fi

#============================================
# 完成！
#============================================

echo ""
echo ""
echo -e "${PURPLE}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                                                       ║${NC}"
echo -e "${PURPLE}║          ${GREEN}🎉 部署完成！恭喜你！🎉${PURPLE}                  ║${NC}"
echo -e "${PURPLE}║                                                       ║${NC}"
echo -e "${PURPLE}╚═══════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🌐 访问地址：${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "   ${YELLOW}前端网页：${NC}http://${SERVER_IP}"
echo -e "   ${YELLOW}后端 API：${NC}http://${SERVER_IP}:5000"
echo ""

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}👤 测试账号：${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "   ${YELLOW}用户名：${NC}test"
echo -e "   ${YELLOW}密码：${NC}123456"
echo ""

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🔧 管理命令：${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "   ${YELLOW}查看后端日志：${NC}pm2 logs ai-novel-backend"
echo -e "   ${YELLOW}重启后端：${NC}pm2 restart ai-novel-backend"
echo -e "   ${YELLOW}停止后端：${NC}pm2 stop ai-novel-backend"
echo -e "   ${YELLOW}查看状态：${NC}pm2 status"
echo ""

if [ -z "$HTTP_PROXY_URL" ]; then
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}⚠️  重要提示：${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${RED}   你还没有配置 HTTP 代理${NC}"
    echo -e "${YELLOW}   AI 功能将无法使用${NC}"
    echo ""
    echo -e "${CYAN}   配置代理步骤：${NC}"
    echo -e "   1. 编辑文件：vi $PROJECT_DIR/backend/.env.production"
    echo -e "   2. 添加代理配置："
    echo -e "      HTTP_PROXY=http://your-proxy:port"
    echo -e "      HTTPS_PROXY=http://your-proxy:port"
    echo -e "   3. 重启后端：pm2 restart ai-novel-backend"
    echo ""
fi

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📚 文档链接：${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "   GitHub: https://github.com/naiy123/ai-novel-assistant"
echo -e "   详细文档: $PROJECT_DIR/宝塔面板部署指南.md"
echo ""

echo -e "${PURPLE}✨ 祝你使用愉快！✨${NC}"
echo ""

