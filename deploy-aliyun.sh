#!/bin/bash

# AI 小说写作助手 - 阿里云自动部署脚本
# 使用 Docker Compose 部署到阿里云 ECS

set -e  # 遇到错误立即退出

echo ""
echo "🚀 AI 小说写作助手 - 阿里云部署工具"
echo "================================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ 请使用 root 用户运行此脚本${NC}"
    echo "   sudo bash deploy-aliyun.sh"
    exit 1
fi

# 步骤 1：检查环境
echo -e "${YELLOW}📋 步骤 1/7: 检查环境...${NC}"

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker 未安装，正在安装...${NC}"
    curl -fsSL https://get.docker.com | bash
    systemctl start docker
    systemctl enable docker
    echo -e "${GREEN}✅ Docker 安装完成${NC}"
else
    echo -e "${GREEN}✅ Docker 已安装${NC}"
fi

# 检查 Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker Compose 未安装，正在安装...${NC}"
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}✅ Docker Compose 安装完成${NC}"
else
    echo -e "${GREEN}✅ Docker Compose 已安装${NC}"
fi

echo ""

# 步骤 2：检查项目目录
echo -e "${YELLOW}📂 步骤 2/7: 检查项目目录...${NC}"

if [ ! -f "backend/server.js" ]; then
    echo -e "${RED}❌ 错误：未找到 backend/server.js${NC}"
    echo "   请确保在项目根目录运行此脚本"
    exit 1
fi
echo -e "${GREEN}✅ 项目目录确认${NC}"
echo ""

# 步骤 3：配置环境变量
echo -e "${YELLOW}⚙️  步骤 3/7: 配置环境变量...${NC}"

if [ ! -f "backend/.env.production" ]; then
    echo -e "${YELLOW}⚠️  创建生产环境配置文件...${NC}"
    
    # 生成随机 JWT_SECRET
    JWT_SECRET=$(openssl rand -hex 32)
    
    # 提示用户输入
    read -p "请输入 Google Cloud Project ID: " PROJECT_ID
    read -p "请输入 HTTP 代理地址（格式：http://host:port，如无请留空）: " HTTP_PROXY_URL
    
    # 创建 .env.production
    cat > backend/.env.production <<EOF
# 服务器配置
PORT=5000
NODE_ENV=production

# JWT 密钥
JWT_SECRET=$JWT_SECRET

# Google Cloud 配置
VERTEX_AI_PROJECT_ID=$PROJECT_ID
VERTEX_AI_LOCATION=us-central1

# HTTP 代理（如果需要）
${HTTP_PROXY_URL:+HTTP_PROXY=$HTTP_PROXY_URL}
${HTTP_PROXY_URL:+HTTPS_PROXY=$HTTP_PROXY_URL}

# 其他配置
TZ=Asia/Shanghai
EOF
    
    echo -e "${GREEN}✅ 环境变量配置完成${NC}"
else
    echo -e "${GREEN}✅ 环境变量文件已存在${NC}"
fi
echo ""

# 步骤 4：检查 Google Cloud 密钥
echo -e "${YELLOW}🔑 步骤 4/7: 检查 Google Cloud 密钥...${NC}"

if [ ! -f "backend/credentials/google-cloud-key.json" ]; then
    echo -e "${RED}❌ 未找到 Google Cloud 密钥文件${NC}"
    echo "   请将密钥文件上传到: backend/credentials/google-cloud-key.json"
    echo ""
    echo "   从本地上传命令："
    echo "   scp your-key.json root@$(hostname -I | awk '{print $1}'):$(pwd)/backend/credentials/google-cloud-key.json"
    echo ""
    read -p "密钥文件已上传？(y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

if [ -f "backend/credentials/google-cloud-key.json" ]; then
    echo -e "${GREEN}✅ Google Cloud 密钥文件已找到${NC}"
else
    echo -e "${RED}❌ 密钥文件仍未找到，退出部署${NC}"
    exit 1
fi
echo ""

# 步骤 5：构建前端
echo -e "${YELLOW}🏗️  步骤 5/7: 构建前端...${NC}"

if [ ! -d "frontend/dist" ]; then
    echo -e "${YELLOW}⚠️  前端未构建，正在构建...${NC}"
    
    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        echo "安装 Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
        apt-get install -y nodejs
    fi
    
    cd frontend
    npm install
    
    # 配置生产环境 API 地址
    echo "VITE_API_BASE_URL=http://$(hostname -I | awk '{print $1}')" > .env.production
    
    npm run build
    cd ..
    echo -e "${GREEN}✅ 前端构建完成${NC}"
else
    echo -e "${GREEN}✅ 前端已构建${NC}"
fi
echo ""

# 步骤 6：停止旧服务
echo -e "${YELLOW}🛑 步骤 6/7: 停止旧服务...${NC}"

if [ "$(docker-compose ps -q)" ]; then
    echo "停止现有容器..."
    docker-compose down
    echo -e "${GREEN}✅ 旧服务已停止${NC}"
else
    echo -e "${GREEN}✅ 无运行中的服务${NC}"
fi
echo ""

# 步骤 7：启动服务
echo -e "${YELLOW}🚀 步骤 7/7: 启动服务...${NC}"

echo "构建镜像..."
docker-compose build --no-cache

echo "启动容器..."
docker-compose up -d

echo ""
echo "等待服务启动..."
sleep 5

# 检查服务状态
echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}✅ 部署完成！${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""

# 显示服务状态
echo "📊 服务状态："
docker-compose ps
echo ""

# 显示访问信息
SERVER_IP=$(hostname -I | awk '{print $1}')
echo "🌐 访问地址："
echo "   前端：http://$SERVER_IP"
echo "   后端：http://$SERVER_IP:5000"
echo ""

# 显示日志命令
echo "📝 查看日志："
echo "   docker-compose logs -f backend    # 后端日志"
echo "   docker-compose logs -f nginx      # Nginx 日志"
echo "   docker-compose logs -f            # 所有日志"
echo ""

# 显示管理命令
echo "🔧 管理命令："
echo "   docker-compose restart            # 重启服务"
echo "   docker-compose stop               # 停止服务"
echo "   docker-compose down               # 停止并删除容器"
echo "   docker-compose up -d              # 启动服务"
echo ""

# 测试后端 API
echo "🧪 测试后端 API..."
sleep 2
if curl -s http://localhost:5000/ | grep -q "AI 小说写作助手"; then
    echo -e "${GREEN}✅ 后端 API 正常${NC}"
else
    echo -e "${YELLOW}⚠️  后端 API 可能还在启动中，请稍后测试${NC}"
fi
echo ""

echo -e "${GREEN}🎉 部署成功！祝使用愉快！${NC}"
echo ""

