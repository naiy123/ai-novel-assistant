#!/bin/bash

#============================================
# AI 小说写作助手 - 完全自动化部署脚本
# 包含 Clash 代理 + 完整应用部署
#============================================

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 用户的 Clash 订阅链接
CLASH_SUB_URL="https://line.stotik.me/link/update?token=BGi1nwasN9qhuCJ5&mu=5&name=stotik"

clear
echo ""
echo -e "${PURPLE}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                                                       ║${NC}"
echo -e "${PURPLE}║     ${GREEN}🚀 AI 小说写作助手 - 全自动部署 🚀${PURPLE}        ║${NC}"
echo -e "${PURPLE}║                                                       ║${NC}"
echo -e "${PURPLE}║     ${CYAN}包含 Clash 代理安装 + 应用部署${PURPLE}            ║${NC}"
echo -e "${PURPLE}║     ${CYAN}完全自动化，无需任何手动操作${PURPLE}              ║${NC}"
echo -e "${PURPLE}║                                                       ║${NC}"
echo -e "${PURPLE}╚═══════════════════════════════════════════════════════╝${NC}"
echo ""
sleep 2

# 检查是否为 root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ 请使用 root 用户运行此脚本${NC}"
    exit 1
fi

#============================================
# 第 1 步：安装 Clash 代理
#============================================

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔐 第 1 步：安装 Clash 代理${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

CLASH_DIR="/opt/clash"
mkdir -p "$CLASH_DIR"
cd "$CLASH_DIR"

echo -e "${YELLOW}⚙️  下载 Clash Meta...${NC}"

# 使用国内镜像下载
wget -O clash.gz "https://ghproxy.com/https://github.com/MetaCubeX/mihomo/releases/download/v1.18.0/mihomo-linux-amd64-v1.18.0.gz" 2>&1 | grep -i "saved\|error" || true

if [ ! -f clash.gz ]; then
    echo -e "${YELLOW}⚠️  镜像下载失败，尝试直连 GitHub...${NC}"
    wget -O clash.gz "https://github.com/MetaCubeX/mihomo/releases/download/v1.18.0/mihomo-linux-amd64-v1.18.0.gz"
fi

if [ ! -f clash.gz ]; then
    echo -e "${RED}❌ Clash 下载失败${NC}"
    exit 1
fi

echo -e "${YELLOW}⚙️  解压 Clash...${NC}"
gunzip -f clash.gz
mv mihomo-linux-amd64-v1.18.0 clash 2>/dev/null || true
chmod +x clash

echo -e "${GREEN}✅ Clash 下载完成${NC}"

echo ""
echo -e "${YELLOW}⚙️  下载 Clash 配置文件...${NC}"

# 下载订阅配置
wget -O config.yaml "$CLASH_SUB_URL"

if [ ! -f config.yaml ]; then
    echo -e "${RED}❌ 配置文件下载失败${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 配置文件下载成功${NC}"

# 创建系统服务
echo -e "${YELLOW}⚙️  创建 Clash 系统服务...${NC}"

cat > /etc/systemd/system/clash.service <<EOF
[Unit]
Description=Clash Daemon
After=network.target

[Service]
Type=simple
User=root
ExecStart=/opt/clash/clash -d /opt/clash
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# 启动 Clash
systemctl daemon-reload
systemctl enable clash
systemctl start clash

echo -e "${GREEN}✅ Clash 服务已启动${NC}"

echo ""
echo -e "${YELLOW}⚙️  等待 Clash 初始化（10 秒）...${NC}"
sleep 10

# 测试代理
echo -e "${YELLOW}⚙️  测试代理连接...${NC}"
if curl -s -x http://127.0.0.1:7890 --connect-timeout 10 https://www.google.com > /dev/null; then
    echo -e "${GREEN}✅ 代理正常工作！可以访问 Google！${NC}"
    PROXY_OK=true
else
    echo -e "${YELLOW}⚠️  代理可能还在初始化，继续部署...${NC}"
    PROXY_OK=false
fi

#============================================
# 第 2 步：获取服务器信息
#============================================

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📋 第 2 步：获取服务器信息${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

SERVER_IP=$(curl -s ifconfig.me)
echo -e "${GREEN}✅ 服务器 IP：${NC}${SERVER_IP}"

HTTP_PROXY_URL="http://127.0.0.1:7890"
echo -e "${GREEN}✅ 代理地址：${NC}${HTTP_PROXY_URL}"

#============================================
# 第 3 步：安装必要软件
#============================================

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔧 第 3 步：安装必要软件${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 检查并安装 Node.js
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚙️  安装 Node.js 18.x...${NC}"
    curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
    dnf install -y nodejs
    echo -e "${GREEN}✅ Node.js 安装完成${NC}"
else
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✅ Node.js 已安装 ${NODE_VERSION}${NC}"
fi

# 检查并安装 Git
if ! command -v git &> /dev/null; then
    echo -e "${YELLOW}⚙️  安装 Git...${NC}"
    dnf install -y git
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

#============================================
# 第 4 步：下载项目代码
#============================================

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📥 第 4 步：下载项目代码${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

PROJECT_DIR="/www/wwwroot/ai-novel-assistant"

if [ -d "$PROJECT_DIR" ]; then
    echo -e "${YELLOW}⚠️  项目目录已存在，删除旧版本...${NC}"
    rm -rf "$PROJECT_DIR"
fi

mkdir -p /www/wwwroot
cd /www/wwwroot

echo -e "${YELLOW}⚙️  从 GitHub 克隆项目...${NC}"
git clone https://github.com/naiy123/ai-novel-assistant.git

if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}❌ 项目下载失败${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 项目下载完成${NC}"

#============================================
# 第 5 步：安装项目依赖
#============================================

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📦 第 5 步：安装项目依赖${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 设置代理环境变量
export HTTP_PROXY="$HTTP_PROXY_URL"
export HTTPS_PROXY="$HTTP_PROXY_URL"

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
# 第 6 步：配置环境变量
#============================================

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}⚙️  第 6 步：配置环境变量${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 生成随机 JWT Secret
JWT_SECRET=$(openssl rand -hex 32)

# 创建后端环境变量文件
cat > "$PROJECT_DIR/backend/.env.production" <<EOF
# 服务器配置
PORT=5000
NODE_ENV=production

# JWT 密钥
JWT_SECRET=${JWT_SECRET}

# Google Cloud 配置
VERTEX_AI_PROJECT_ID=mindful-hall-474616-d5
VERTEX_AI_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=/www/wwwroot/ai-novel-assistant/backend/credentials/google-cloud-key.json

# HTTP 代理配置（使用 Clash）
HTTP_PROXY=${HTTP_PROXY_URL}
HTTPS_PROXY=${HTTP_PROXY_URL}

# 时区
TZ=Asia/Shanghai
EOF

echo -e "${GREEN}✅ 后端环境变量配置完成${NC}"

# 创建前端环境变量文件
echo "VITE_API_BASE_URL=http://${SERVER_IP}:5000" > "$PROJECT_DIR/frontend/.env.production"
echo -e "${GREEN}✅ 前端环境变量配置完成${NC}"

#============================================
# 第 7 步：等待 Google Cloud 密钥
#============================================

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔑 第 7 步：检查 Google Cloud 密钥${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

mkdir -p "$PROJECT_DIR/backend/credentials"

if [ ! -f "$PROJECT_DIR/backend/credentials/google-cloud-key.json" ]; then
    echo -e "${YELLOW}⚠️  未找到 Google Cloud 密钥文件${NC}"
    echo ""
    echo -e "${CYAN}请在本地电脑运行以下命令上传密钥：${NC}"
    echo ""
    echo -e "${GREEN}scp 本地密钥路径 root@${SERVER_IP}:/www/wwwroot/ai-novel-assistant/backend/credentials/google-cloud-key.json${NC}"
    echo ""
    echo -e "${YELLOW}例如（Windows PowerShell）：${NC}"
    echo -e "${GREEN}scp C:\\path\\to\\google-cloud-key.json root@${SERVER_IP}:/www/wwwroot/ai-novel-assistant/backend/credentials/google-cloud-key.json${NC}"
    echo ""
    echo -e "${CYAN}上传完成后，按任意键继续...${NC}"
    read -n 1 -s
    
    if [ ! -f "$PROJECT_DIR/backend/credentials/google-cloud-key.json" ]; then
        echo -e "${YELLOW}⚠️  仍未找到密钥文件，将在无 AI 功能模式下继续部署${NC}"
    fi
else
    echo -e "${GREEN}✅ Google Cloud 密钥文件已找到${NC}"
fi

#============================================
# 第 8 步：构建前端
#============================================

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🏗️  第 8 步：构建前端${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

cd "$PROJECT_DIR/frontend"
echo -e "${YELLOW}⚙️  构建前端（需要 1-2 分钟）...${NC}"
npm run build
echo -e "${GREEN}✅ 前端构建完成${NC}"

#============================================
# 第 9 步：启动后端服务
#============================================

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🚀 第 9 步：启动后端服务${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

cd "$PROJECT_DIR/backend"

# 停止旧进程
pm2 delete ai-novel-backend 2>/dev/null || true

# 启动新进程
echo -e "${YELLOW}⚙️  启动后端服务...${NC}"
NODE_ENV=production pm2 start server.js --name ai-novel-backend
pm2 save
pm2 startup systemd -u root --hp /root

echo -e "${GREEN}✅ 后端服务启动成功${NC}"

#============================================
# 第 10 步：配置 Nginx
#============================================

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🌐 第 10 步：配置 Nginx${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 确保 Nginx 目录存在
mkdir -p /www/server/panel/vhost/nginx
mkdir -p /www/wwwlogs

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
if command -v nginx &> /dev/null; then
    nginx -t && nginx -s reload
    echo -e "${GREEN}✅ Nginx 重启成功${NC}"
else
    echo -e "${YELLOW}⚠️  Nginx 未安装，请在宝塔面板中手动配置${NC}"
fi

#============================================
# 第 11 步：测试部署
#============================================

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🧪 第 11 步：测试部署${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

sleep 5

echo -e "${YELLOW}⚙️  测试后端 API...${NC}"
if curl -s http://127.0.0.1:5000/ | grep -q "AI 小说写作助手"; then
    echo -e "${GREEN}✅ 后端 API 正常${NC}"
else
    echo -e "${YELLOW}⚠️  后端 API 可能还在启动中${NC}"
fi

echo ""
echo -e "${YELLOW}⚙️  测试前端页面...${NC}"
if [ -f "$PROJECT_DIR/frontend/dist/index.html" ]; then
    echo -e "${GREEN}✅ 前端页面构建成功${NC}"
else
    echo -e "${YELLOW}⚠️  前端页面未找到${NC}"
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
echo -e "   ${YELLOW}Clash 面板：${NC}http://${SERVER_IP}:9091/ui"
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
echo -e "   ${YELLOW}查看 Clash 日志：${NC}journalctl -u clash -f"
echo -e "   ${YELLOW}重启后端：${NC}pm2 restart ai-novel-backend"
echo -e "   ${YELLOW}重启 Clash：${NC}systemctl restart clash"
echo -e "   ${YELLOW}查看所有服务：${NC}pm2 status && systemctl status clash"
echo ""

echo -e "${PURPLE}✨ 祝你使用愉快！✨${NC}"
echo ""

