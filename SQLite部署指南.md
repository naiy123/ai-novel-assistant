# 🗄️ SQLite数据库部署指南

## ✨ 重要改进

**从内存数据库升级到SQLite！**

- ✅ **数据持久化**：服务器重启后数据不会丢失
- ✅ **性能优化**：使用WAL模式提高并发性能
- ✅ **自动初始化**：首次启动自动创建表结构和示例数据
- ✅ **无需额外服务**：SQLite是文件数据库，无需安装数据库服务器

---

## 📦 本地测试（已完成）

依赖已安装：
```bash
cd backend
npm install better-sqlite3 --save
```

---

## 🚀 服务器部署步骤

### 1. 推送代码到GitHub

```bash
# 检查修改
git status

# 提交代码
git add .
git commit -m "升级到SQLite数据库并添加Nginx配置"
git push
```

### 2. 服务器拉取更新

```bash
# SSH登录服务器
ssh 你的用户名@你的服务器IP

# 进入项目目录
cd /你的项目路径/ai-novel-assistant

# 拉取最新代码
git pull

# 安装新依赖
cd backend
npm install
```

### 3. 数据库初始化

**首次运行时自动初始化：**

```bash
# 后端会自动创建数据库文件：backend/database/novel.db
# 包含以下内容：
# - 创建所有表结构
# - 创建测试用户（test/123456）
# - 创建示例卡片
```

**数据库文件位置：**
```
backend/database/novel.db
```

### 4. 重启服务

```bash
# 使用PM2重启
pm2 restart all

# 或使用配置文件
pm2 restart ecosystem.config.js

# 查看日志确认启动成功
pm2 logs
```

---

## 🌐 Nginx配置

### 方案A：使用Nginx反向代理（推荐）

**优点**：
- ✅ 前后端使用同一个域名/端口
- ✅ 无需处理CORS问题
- ✅ 可以配置HTTPS
- ✅ 性能更好

**配置步骤：**

1. **复制配置文件**

```bash
sudo cp nginx/ai-novel-assistant.conf /etc/nginx/sites-available/ai-novel-assistant

# 或手动创建
sudo nano /etc/nginx/sites-available/ai-novel-assistant
# 粘贴 nginx/ai-novel-assistant.conf 的内容
```

2. **修改配置**

需要修改的地方：
```nginx
server_name 你的域名或IP;  # 如：118.170.194.12 或 novel.example.com

location / {
    root /你的服务器路径/ai-novel-assistant/frontend/dist;  # 修改为实际路径
}
```

3. **启用配置**

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/ai-novel-assistant /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl reload nginx
```

4. **访问应用**

```
http://你的域名
或
http://你的IP
```

**现在前端和后端API都通过同一个地址访问！**

### 方案B：不使用Nginx（简单但功能少）

保持原有的端口访问方式：
- 前端：`http://服务器IP:3000`
- 后端：`http://服务器IP:5000`

---

## 📊 数据库管理

### 查看数据库

**使用SQLite命令行：**

```bash
# 安装SQLite（如果没有）
# Ubuntu/Debian
sudo apt install sqlite3

# CentOS/RHEL
sudo yum install sqlite

# 进入数据库
cd backend/database
sqlite3 novel.db

# SQLite命令
.tables              # 查看所有表
.schema users        # 查看表结构
SELECT * FROM users; # 查询数据
.quit                # 退出
```

### 备份数据库

```bash
# 简单备份
cp backend/database/novel.db backend/database/novel.db.backup

# 带时间戳的备份
cp backend/database/novel.db backend/database/novel-$(date +%Y%m%d-%H%M%S).db

# 自动备份脚本（添加到crontab）
# 每天凌晨2点自动备份
0 2 * * * cp /你的路径/backend/database/novel.db /你的路径/backup/novel-$(date +\%Y\%m\%d).db
```

### 恢复数据库

```bash
# 停止服务
pm2 stop all

# 恢复备份
cp backend/database/novel.db.backup backend/database/novel.db

# 重启服务
pm2 start all
```

---

## 🔍 测试检查

### 1. 检查数据库文件

```bash
ls -lh backend/database/novel.db
```

应该看到数据库文件存在且有大小。

### 2. 测试API

```bash
# 测试登录
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"123456"}'

# 测试小说列表
curl http://localhost:5000/api/novels
```

### 3. 测试数据持久化

```bash
# 创建一个测试小说（通过前端或API）
# 重启服务
pm2 restart all

# 再次访问，检查数据是否还在
```

---

## ⚠️ 注意事项

### 1. 数据库文件权限

确保Node.js进程有读写权限：

```bash
# 检查权限
ls -l backend/database/novel.db

# 如果需要，修改权限
chmod 664 backend/database/novel.db
```

### 2. 磁盘空间

SQLite数据库文件会随着数据增长而变大，确保有足够的磁盘空间。

```bash
# 查看磁盘空间
df -h

# 查看数据库大小
du -h backend/database/novel.db
```

### 3. 并发性能

SQLite使用WAL模式，支持多个读取和一个写入的并发操作，对于小到中型应用完全够用。

### 4. 数据库锁定

如果遇到"database is locked"错误，通常是因为：
- 多个进程同时写入
- 事务未正确提交

**解决方法**：
```bash
# 重启服务通常可以解决
pm2 restart all
```

---

## 🆚 对比：内存数据库 vs SQLite

| 特性 | 内存数据库 | SQLite |
|------|-----------|--------|
| **数据持久化** | ❌ 重启丢失 | ✅ 永久保存 |
| **性能** | 🚀 最快 | ⚡ 很快 |
| **内存占用** | 高 | 低 |
| **适用场景** | 测试/开发 | 生产环境 |
| **数据备份** | ❌ 不支持 | ✅ 简单 |
| **数据迁移** | ❌ 困难 | ✅ 容易 |

---

## 📈 性能优化建议

### 1. 定期清理WAL文件

```bash
# 进入数据库
sqlite3 backend/database/novel.db

# 执行清理
PRAGMA wal_checkpoint(TRUNCATE);
.quit
```

### 2. 定期备份

设置定时备份任务（见上面的备份部分）。

### 3. 监控数据库大小

```bash
# 添加到监控脚本
watch -n 60 'du -h backend/database/novel.db'
```

---

## 🔄 从内存数据库迁移（如果有旧数据）

**注意**：如果你的服务器上有旧的内存数据库数据，拉取新代码后这些数据会丢失（因为内存数据库本身就是临时的）。

**建议**：
1. 记录重要数据
2. 拉取新代码
3. 重新在SQLite中创建数据

---

## ✅ 快速部署命令汇总

```bash
# 1. 拉取代码
git pull

# 2. 安装依赖
cd backend && npm install && cd ..

# 3. 构建前端
cd frontend && npm run build && cd ..

# 4. 重启服务
pm2 restart all

# 5. 配置Nginx（可选）
sudo cp nginx/ai-novel-assistant.conf /etc/nginx/sites-available/ai-novel-assistant
sudo ln -s /etc/nginx/sites-available/ai-novel-assistant /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 6. 查看日志
pm2 logs

# 7. 测试访问
curl http://localhost:5000/api/novels
```

---

## 🎉 部署完成

现在你的应用：
- ✅ 使用SQLite持久化数据
- ✅ 支持Nginx反向代理
- ✅ 数据不会因重启丢失
- ✅ 更接近生产环境标准

**开始使用吧！** 🚀

