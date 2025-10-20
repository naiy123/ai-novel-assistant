# 🔔 宝塔 WebHook 自动部署指南

## ✨ Push 到 GitHub 后，服务器自动更新！

---

## 🎯 工作流程

```
你 Push 代码到 GitHub
    ↓
GitHub 发送 WebHook 通知
    ↓
宝塔接收并触发脚本
    ↓
自动拉取代码、构建、重启
    ↓
完成！🎉
```

---

## ⚙️ 配置步骤

### 第 1 步：在服务器上准备部署脚本

登录宝塔面板，打开终端，运行：

```bash
# 进入项目目录
cd /www/wwwroot/ai-novel-assistant

# 给脚本添加执行权限
chmod +x webhook-deploy.sh

# 测试脚本是否能正常运行
bash webhook-deploy.sh
```

如果看到 `🎉 部署完成！`，说明脚本正常。

---

### 第 2 步：在宝塔面板配置 WebHook

#### 1. 打开 WebHook 设置

登录宝塔面板，进入：

```
首页 → 软件商店 → 找到"宝塔WebHook" → 设置
```

如果没有安装，先点击"安装"。

#### 2. 添加 WebHook

点击 **"添加钩子"**，填写：

- **名称**：`AI小说助手自动部署`
- **执行脚本**：
  ```bash
  #!/bin/bash
  bash /www/wwwroot/ai-novel-assistant/webhook-deploy.sh
  ```
- **脚本备注**：`GitHub Push 自动部署`

点击 **"提交"** 保存。

#### 3. 获取 WebHook URL

保存后，会显示一个 URL，类似：

```
http://8.130.74.146:8888/hook?access_key=xxxxxx&token=xxxxxx
```

**复制这个 URL**，后面要用。

---

### 第 3 步：在 GitHub 配置 WebHook

#### 1. 打开 GitHub 仓库设置

进入你的仓库：
```
https://github.com/naiy123/ai-novel-assistant
```

点击：**Settings** → **Webhooks** → **Add webhook**

#### 2. 配置 WebHook

填写以下信息：

- **Payload URL**：粘贴宝塔提供的 URL
  ```
  http://8.130.74.146:8888/hook?access_key=xxxxxx&token=xxxxxx
  ```

- **Content type**：选择 `application/json`

- **Secret**：留空（可选）

- **Which events would you like to trigger this webhook?**
  选择：`Just the push event`

- **Active**：打勾 ✅

点击 **"Add webhook"** 保存。

#### 3. 测试 WebHook

GitHub 会自动发送一个测试请求。

在 Webhooks 页面，点击刚创建的 webhook，查看 **"Recent Deliveries"**：

- ✅ 绿色勾 = 成功
- ❌ 红色叉 = 失败

---

## 🚀 使用方法

### 自动部署

现在，每次你 Push 代码：

```bash
git add .
git commit -m "Update feature"
git push
```

**GitHub 会自动通知宝塔，宝塔会自动部署！** 🎉

---

## 📊 查看部署日志

### 在宝塔面板查看

1. 登录宝塔面板
2. 进入：**首页 → WebHook → 查看日志**
3. 可以看到每次部署的记录

### 在服务器查看详细日志

打开宝塔终端，运行：

```bash
# 查看最新的部署日志
tail -f /www/wwwroot/ai-novel-assistant/deploy.log

# 查看最后 50 行日志
tail -n 50 /www/wwwroot/ai-novel-assistant/deploy.log

# 搜索错误日志
grep "❌" /www/wwwroot/ai-novel-assistant/deploy.log
```

---

## 🎨 自定义部署脚本

### 修改 webhook-deploy.sh

```bash
# 编辑部署脚本
nano /www/wwwroot/ai-novel-assistant/webhook-deploy.sh
```

### 常用自定义

#### 1. 发送通知（钉钉/企业微信）

在脚本最后添加：

```bash
# 发送钉钉通知
curl 'https://oapi.dingtalk.com/robot/send?access_token=YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "msgtype": "text",
    "text": {
      "content": "✅ AI小说助手部署成功！"
    }
  }'
```

#### 2. 部署前备份

在 `git pull` 之前添加：

```bash
# 备份当前版本
BACKUP_DIR="/www/backup/ai-novel-$(date +%Y%m%d_%H%M%S)"
cp -r /www/wwwroot/ai-novel-assistant "$BACKUP_DIR"
log "✅ 备份完成：$BACKUP_DIR"
```

#### 3. 数据库迁移

在重启服务前添加：

```bash
# 运行数据库迁移
cd "$PROJECT_DIR/backend"
npm run migrate
```

#### 4. 清理 Docker 镜像（如果使用）

```bash
# 清理未使用的 Docker 镜像
docker system prune -af
```

---

## 🔒 安全建议

### 1. 限制 WebHook 访问

在宝塔防火墙中，只允许 GitHub 的 IP 访问 WebHook：

```
GitHub Webhook IPs:
140.82.112.0/20
185.199.108.0/22
192.30.252.0/22
```

### 2. 使用 Secret 验证

在 GitHub WebHook 设置中添加 Secret，并在脚本中验证：

```bash
# 验证 GitHub Secret
GITHUB_SECRET="your-secret-here"
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$GITHUB_SECRET")
```

### 3. 限制脚本权限

```bash
# 设置脚本为只读
chmod 500 webhook-deploy.sh

# 设置日志文件权限
chmod 600 deploy.log
```

---

## 🆘 常见问题

### Q1: WebHook 没有触发？

**排查步骤**：

1. **检查 GitHub WebHook 状态**
   - 进入 GitHub 仓库 → Settings → Webhooks
   - 查看 Recent Deliveries，是否有错误

2. **检查宝塔 WebHook 日志**
   - 宝塔面板 → WebHook → 查看日志
   - 看是否收到请求

3. **检查防火墙**
   - 确保 8888 端口开放
   - 宝塔面板 → 安全 → 放行端口 8888

4. **手动测试**
   ```bash
   # 在服务器运行脚本
   bash /www/wwwroot/ai-novel-assistant/webhook-deploy.sh
   ```

### Q2: 部署失败怎么办？

**查看错误日志**：

```bash
# 查看部署日志
cat /www/wwwroot/ai-novel-assistant/deploy.log

# 查看 PM2 日志
pm2 logs ai-novel-backend --err
```

**常见错误**：

- ❌ `Git pull failed` → 检查是否有未提交的修改
- ❌ `npm install failed` → 检查 package.json 是否有错
- ❌ `Build failed` → 检查前端代码是否有语法错误
- ❌ `PM2 restart failed` → 检查后端是否能正常启动

### Q3: 如何临时禁用自动部署？

**方法 1**：在 GitHub 禁用

GitHub 仓库 → Settings → Webhooks → 编辑 webhook → 取消勾选 "Active"

**方法 2**：在宝塔禁用

宝塔面板 → WebHook → 编辑钩子 → 暂停钩子

### Q4: 如何回滚到上一个版本？

在宝塔终端运行：

```bash
cd /www/wwwroot/ai-novel-assistant

# 查看最近的提交
git log --oneline -10

# 回滚到指定版本
git reset --hard <commit-id>

# 重新构建和重启
bash webhook-deploy.sh
```

---

## 📈 监控部署状态

### 1. 实时监控

在宝塔终端运行：

```bash
# 实时查看部署日志
tail -f /www/wwwroot/ai-novel-assistant/deploy.log

# 实时查看 PM2 日志
pm2 logs ai-novel-backend --lines 50
```

### 2. 部署统计

```bash
# 统计部署次数
grep "🎉 部署完成" /www/wwwroot/ai-novel-assistant/deploy.log | wc -l

# 统计失败次数
grep "❌" /www/wwwroot/ai-novel-assistant/deploy.log | wc -l

# 查看最近 10 次部署时间
grep "🔔 WebHook 触发" /www/wwwroot/ai-novel-assistant/deploy.log | tail -10
```

---

## ✅ 最佳实践

### 推荐工作流程

```
1. 在本地开发分支开发
   ↓
2. 测试通过后合并到 main 分支
   ↓
3. Push 到 GitHub
   ↓
4. WebHook 自动部署
   ↓
5. 查看部署日志确认成功
```

### 部署检查清单

- [ ] 代码已通过本地测试
- [ ] 已更新 package.json 版本号
- [ ] 已更新 CHANGELOG.md
- [ ] 数据库迁移脚本已准备
- [ ] 环境变量已配置
- [ ] 部署日志正常
- [ ] 服务已成功重启
- [ ] 网站可以正常访问

---

## 🎉 享受全自动部署！

现在你的部署流程变成：

1. 写代码 ✍️
2. `git push` 🚀
3. 等待自动部署 ⏳
4. 完成！✅

**再也不用手动部署了！** 🎊

