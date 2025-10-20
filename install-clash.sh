#!/bin/bash

#============================================
# Clash 代理一键安装脚本
# 适用于阿里云 ECS（CentOS/Rocky Linux）
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
echo -e "${PURPLE}║     ${GREEN}🚀 Clash 代理一键安装脚本 🚀${PURPLE}      ║${NC}"
echo -e "${PURPLE}║                                           ║${NC}"
echo -e "${PURPLE}╚═══════════════════════════════════════════╝${NC}"
echo ""

# 检查是否为 root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ 请使用 root 用户运行此脚本${NC}"
    exit 1
fi

#============================================
# 第 1 步：下载 Clash
#============================================

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📥 第 1 步：下载 Clash${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

CLASH_DIR="/opt/clash"
mkdir -p "$CLASH_DIR"
cd "$CLASH_DIR"

echo -e "${YELLOW}⚙️  下载 Clash Meta（最新版）...${NC}"

# 使用 Clash Meta（mihomo）- 更活跃的分支
CLASH_VERSION="v1.18.0"
wget -O clash.gz "https://github.com/MetaCubeX/mihomo/releases/download/${CLASH_VERSION}/mihomo-linux-amd64-${CLASH_VERSION}.gz"

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  GitHub 下载失败，尝试使用镜像源...${NC}"
    # 使用国内镜像
    wget -O clash.gz "https://ghproxy.com/https://github.com/MetaCubeX/mihomo/releases/download/${CLASH_VERSION}/mihomo-linux-amd64-${CLASH_VERSION}.gz"
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ 下载失败，请检查网络连接${NC}"
        exit 1
    fi
fi

echo -e "${YELLOW}⚙️  解压 Clash...${NC}"
gunzip -f clash.gz
mv mihomo-linux-amd64-* clash 2>/dev/null || true
chmod +x clash

echo -e "${GREEN}✅ Clash 下载完成${NC}"

#============================================
# 第 2 步：配置 Clash
#============================================

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}⚙️  第 2 步：配置 Clash${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${CYAN}请输入你的 Clash 订阅链接：${NC}"
echo -e "${YELLOW}（这是你的机场提供的订阅 URL）${NC}"
read -p "订阅链接: " CLASH_SUB_URL

if [ -z "$CLASH_SUB_URL" ]; then
    echo -e "${RED}❌ 订阅链接不能为空${NC}"
    exit 1
fi

echo -e "${YELLOW}⚙️  下载配置文件...${NC}"
wget -O config.yaml "$CLASH_SUB_URL"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 配置下载失败，请检查订阅链接${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 配置文件下载成功${NC}"

# 修改配置，确保开启 HTTP 代理
echo -e "${YELLOW}⚙️  配置代理端口...${NC}"

cat >> config.yaml <<'EOF'

# 添加 HTTP 代理配置
port: 7890
socks-port: 7891
allow-lan: true
mode: rule
log-level: info
external-controller: 0.0.0.0:9090
EOF

echo -e "${GREEN}✅ 代理端口配置完成（HTTP: 7890, SOCKS: 7891）${NC}"

#============================================
# 第 3 步：创建系统服务
#============================================

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔧 第 3 步：创建系统服务${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

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

echo -e "${GREEN}✅ 系统服务创建完成${NC}"

#============================================
# 第 4 步：启动 Clash
#============================================

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🚀 第 4 步：启动 Clash${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

systemctl daemon-reload
systemctl enable clash
systemctl start clash

sleep 3

if systemctl is-active --quiet clash; then
    echo -e "${GREEN}✅ Clash 启动成功！${NC}"
else
    echo -e "${RED}❌ Clash 启动失败${NC}"
    echo -e "${YELLOW}查看日志: journalctl -u clash -f${NC}"
    exit 1
fi

#============================================
# 第 5 步：测试代理
#============================================

echo ""
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🧪 第 5 步：测试代理${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${YELLOW}⚙️  测试 Google 连接...${NC}"
if curl -s -x http://127.0.0.1:7890 --connect-timeout 10 https://www.google.com > /dev/null; then
    echo -e "${GREEN}✅ 代理正常，可以访问 Google！${NC}"
else
    echo -e "${YELLOW}⚠️  代理可能还在初始化，请稍后测试${NC}"
fi

#============================================
# 完成！
#============================================

echo ""
echo ""
echo -e "${PURPLE}╔═══════════════════════════════════════════╗${NC}"
echo -e "${PURPLE}║                                           ║${NC}"
echo -e "${PURPLE}║     ${GREEN}🎉 Clash 安装完成！🎉${PURPLE}            ║${NC}"
echo -e "${PURPLE}║                                           ║${NC}"
echo -e "${PURPLE}╚═══════════════════════════════════════════╝${NC}"
echo ""

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📋 代理信息：${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "   ${YELLOW}HTTP 代理：${NC}http://127.0.0.1:7890"
echo -e "   ${YELLOW}SOCKS5 代理：${NC}socks5://127.0.0.1:7891"
echo -e "   ${YELLOW}控制面板：${NC}http://$(curl -s ifconfig.me):9090/ui"
echo ""

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🔧 管理命令：${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "   ${YELLOW}查看状态：${NC}systemctl status clash"
echo -e "   ${YELLOW}查看日志：${NC}journalctl -u clash -f"
echo -e "   ${YELLOW}重启服务：${NC}systemctl restart clash"
echo -e "   ${YELLOW}停止服务：${NC}systemctl stop clash"
echo -e "   ${YELLOW}测试代理：${NC}curl -x http://127.0.0.1:7890 https://www.google.com"
echo ""

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}📝 下一步操作：${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}现在你可以运行 AI 小说助手部署脚本了：${NC}"
echo ""
echo -e "${GREEN}curl -sSL https://raw.githubusercontent.com/naiy123/ai-novel-assistant/main/install-baota.sh | bash${NC}"
echo ""
echo -e "${YELLOW}部署脚本会自动检测并使用 Clash 代理！${NC}"
echo ""

echo -e "${PURPLE}✨ Clash 安装完成，祝你使用愉快！✨${NC}"
echo ""

