#!/bin/bash

# AI 小说写作助手 - 带代理启动脚本（Linux/Mac）
# 用于在中国网络环境下启动应用

echo ""
echo "🚀 启动 AI 小说写作助手（带代理）"
echo "============================================================"
echo ""

# ===== 配置区域 =====
# 请修改为你的代理地址和端口
PROXY_HOST="127.0.0.1"
PROXY_PORT="7890"
# ====================

PROXY_URL="http://${PROXY_HOST}:${PROXY_PORT}"

echo "⚙️  配置信息:"
echo "  - 代理地址: $PROXY_URL"
echo "  - 项目目录: $(pwd)"
echo ""

# 检查代理是否可用
echo "🔍 检查代理连接..."
if curl -s --proxy "$PROXY_URL" --max-time 5 https://www.google.com > /dev/null 2>&1; then
    echo "✅ 代理连接正常"
else
    echo "⚠️  警告：代理连接失败"
    echo ""
    echo "请检查:"
    echo "  1. 代理软件（Clash/V2Ray）是否已启动"
    echo "  2. 代理地址和端口是否正确: $PROXY_URL"
    echo "  3. 在浏览器中测试能否访问 Google"
    echo ""
    read -p "是否继续启动？(y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "已取消启动"
        exit 1
    fi
fi

echo ""
echo "============================================================"
echo ""

# 设置代理环境变量
export HTTP_PROXY="$PROXY_URL"
export HTTPS_PROXY="$PROXY_URL"

echo "📦 启动后端服务..."
cd backend || exit
npm run dev &
BACKEND_PID=$!
echo "   后端 PID: $BACKEND_PID"

cd ..

# 等待后端启动
sleep 3

echo "🎨 启动前端服务..."
cd frontend || exit
npm run dev &
FRONTEND_PID=$!
echo "   前端 PID: $FRONTEND_PID"

cd ..

sleep 2

echo ""
echo "============================================================"
echo "✅ 启动完成！"
echo "============================================================"
echo ""
echo "📍 访问地址:"
echo "  - 前端: http://localhost:3000"
echo "  - 后端: http://localhost:5000"
echo ""
echo "💡 提示:"
echo "  - 后端已配置代理: $PROXY_URL"
echo "  - 按 Ctrl+C 停止所有服务"
echo "  - 后端日志将显示完整的 API 请求/响应"
echo ""

# 捕获终止信号
trap "echo ''; echo '🛑 停止服务...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM

# 等待进程
wait

