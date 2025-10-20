#!/bin/bash

# 备份脚本 - 备份重要数据

BACKUP_DIR="/backup/ai-novel-assistant/$(date +%Y%m%d_%H%M%S)"

echo "💾 开始备份..."
echo "备份目录: $BACKUP_DIR"
echo ""

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库（如果有）
if [ -d "backend/data" ]; then
    echo "📦 备份数据库..."
    tar czf $BACKUP_DIR/data.tar.gz backend/data
    echo "✅ 数据库备份完成"
fi

# 备份环境配置
if [ -f "backend/.env.production" ]; then
    echo "📋 备份配置文件..."
    cp backend/.env.production $BACKUP_DIR/
    echo "✅ 配置文件备份完成"
fi

# 备份 Docker 数据卷（如果有）
if [ "$(docker volume ls -q)" ]; then
    echo "🐳 备份 Docker 数据卷..."
    docker run --rm -v ai-novel-assistant_data:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/docker-volumes.tar.gz /data
    echo "✅ Docker 数据卷备份完成"
fi

echo ""
echo "✅ 备份完成！"
echo "备份位置: $BACKUP_DIR"
echo ""
echo "备份内容："
ls -lh $BACKUP_DIR/

