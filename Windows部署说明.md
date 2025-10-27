# 🎉 Windows 部署说明

## ✅ 当前部署状态

| 服务 | 状态 | 端口 | 管理工具 |
|------|------|------|----------|
| 前端网站 | 🟢 运行中 | 80 | PM2 |
| 后端 API | 🟢 运行中 | 5000 | PM2 |

---

## 🌐 访问地址

### 服务器信息
- **公网 IP**: `118.170.194.12`
- **内网 IP**: `192.168.1.86`

### 访问方式
- **前端网站**: http://118.170.194.12
- **后端 API**: http://118.170.194.12:5000
- **本地访问**: http://localhost

---

## ⚠️ 重要：开放端口

### 阿里云安全组配置

如果无法访问，需要在阿里云控制台开放端口：

1. 登录 [阿里云ECS控制台](https://ecs.console.aliyun.com/)
2. 找到实例 `SD-20240829MGHC`
3. 点击「安全组」→「配置规则」→「入方向」
4. 添加规则：

| 端口 | 协议 | 授权对象 | 说明 |
|------|------|----------|------|
| 80 | TCP | 0.0.0.0/0 | HTTP访问 |
| 5000 | TCP | 0.0.0.0/0 | 后端API |
| 443 | TCP | 0.0.0.0/0 | HTTPS（可选）|

### Windows 防火墙

如果需要手动配置：

```powershell
New-NetFirewallRule -DisplayName "AI Novel Frontend" -Direction Inbound -LocalPort 80 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "AI Novel Backend" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow
```

---

## 🛠️ 服务管理

### 快捷脚本

```powershell
# 查看服务状态
.\查看状态.ps1

# 启动所有服务
.\启动服务.ps1

# 重启所有服务
.\重启服务.ps1

# 停止所有服务
.\停止服务.ps1
```

### PM2 常用命令

```powershell
# 查看状态
pm2 status

# 查看日志
pm2 logs

# 查看实时监控
pm2 monit

# 重启服务
pm2 restart all
```

**完整命令列表**：查看 [管理命令.md](./管理命令.md)

---

## 🔄 更新应用

### 更新后端

```powershell
cd backend
git pull
npm install
pm2 restart ai-novel-backend
```

### 更新前端

```powershell
cd frontend
git pull
npm install
npm run build
pm2 restart ai-novel-frontend
```

---

## 🔧 配置域名（可选）

如果有域名，可以配置DNS解析：

### 1. 添加DNS记录

| 记录类型 | 主机记录 | 记录值 |
|---------|---------|--------|
| A | @ | 118.170.194.12 |
| A | www | 118.170.194.12 |

### 2. 等待生效（5-30分钟）

```powershell
# 测试DNS解析
ping 你的域名
```

### 3. 访问

- http://你的域名
- http://www.你的域名

---

## 🆘 故障排查

### 问题1：网站无法访问

**检查步骤**：
1. 查看服务状态：`pm2 status`
2. 查看端口监听：`netstat -ano | Select-String ":80"`
3. 检查防火墙：确保阿里云安全组已开放80端口
4. 查看错误日志：`pm2 logs --err`

### 问题2：服务自动停止

**解决**：设置开机自启
```powershell
pm2 save
pm2 startup
```

### 问题3：端口被占用

**检查并杀死进程**：
```powershell
# 查看端口占用
netstat -ano | Select-String ":80"

# 杀死进程（替换<PID>为实际进程ID）
Stop-Process -Id <PID> -Force
```

### 问题4：后端API错误

**查看日志**：
```powershell
pm2 logs ai-novel-backend --lines 50
```

**常见原因**：
- Google Cloud密钥配置错误
- 环境变量未设置
- 无法访问Google API（需要代理）

---

## 📊 监控服务

```powershell
# 实时监控CPU和内存
pm2 monit

# 查看服务详情
pm2 info ai-novel-backend
pm2 info ai-novel-frontend

# 查看最近日志
pm2 logs --lines 100
```

---

## 🔐 安全建议

### 1. 修改JWT密钥

编辑 `backend/.env`：
```env
JWT_SECRET=一个很长的随机字符串
```

### 2. 配置HTTPS（推荐）

获取SSL证书后配置Nginx反向代理。

### 3. 限制后端端口

如果不需要外网直接访问API，可以：
- 关闭安全组的5000端口
- 只允许内网访问

---

## 📁 项目结构

```
ai-novel-assistant/
├── backend/              # 后端服务
│   ├── server.js        # 入口文件
│   ├── .env             # 环境配置
│   └── credentials/     # Google密钥
├── frontend/            # 前端应用
│   ├── src/            # 源代码
│   └── dist/           # 构建输出
├── 启动服务.ps1        # 启动脚本
├── 停止服务.ps1        # 停止脚本
├── 重启服务.ps1        # 重启脚本
└── 查看状态.ps1        # 状态查看
```

---

## 📞 技术支持

### 系统信息
- **Node.js**: v22.20.0
- **npm**: 10.9.3
- **PM2**: 已安装
- **操作系统**: Windows Server

### 检查清单

在寻求帮助前，请确认：
- [ ] PM2服务状态正常（`pm2 status`）
- [ ] 端口正在监听（`netstat -ano | Select-String ":80"`）
- [ ] 阿里云安全组已开放端口
- [ ] 查看了错误日志（`pm2 logs --err`）

---

**🎉 部署完成！开始使用吧！**



