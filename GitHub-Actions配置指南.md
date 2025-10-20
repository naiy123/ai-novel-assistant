# 🤖 GitHub Actions 自动部署指南

## ✨ Push 代码后自动部署到服务器！

---

## 🎯 工作流程

```
你 Push 代码到 GitHub
    ↓
GitHub Actions 自动触发
    ↓
连接到阿里云服务器
    ↓
拉取最新代码
    ↓
安装依赖 + 构建前端
    ↓
重启服务
    ↓
完成！🎉
```

---

## ⚙️ 配置步骤

### 第 1 步：生成 SSH 密钥

在**本地电脑** PowerShell 运行：

```powershell
# 生成新的 SSH 密钥对
ssh-keygen -t rsa -b 4096 -f github-actions-key

# 会生成两个文件：
# github-actions-key       （私钥）
# github-actions-key.pub   （公钥）
```

### 第 2 步：将公钥添加到服务器

#### 方法 1：手动添加

1. 打开 `github-actions-key.pub` 文件，复制内容
2. 登录宝塔面板
3. 进入终端，运行：

```bash
echo "你的公钥内容" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

#### 方法 2：使用命令

在本地 PowerShell 运行：

```powershell
type github-actions-key.pub | ssh root@8.130.74.146 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
```

### 第 3 步：将私钥添加到 GitHub Secrets

1. 打开 `github-actions-key` 文件（私钥），**完整复制内容**（包括 `-----BEGIN` 和 `-----END`）

2. 进入 GitHub 仓库页面：
   ```
   https://github.com/naiy123/ai-novel-assistant
   ```

3. 点击：**Settings** → **Secrets and variables** → **Actions**

4. 点击：**New repository secret**

5. 添加密钥：
   - Name: `SSH_PRIVATE_KEY`
   - Secret: **粘贴私钥全部内容**
   
6. 点击：**Add secret**

---

## 🚀 使用方法

### 自动部署（推荐）

每次你 Push 代码到 `main` 分支，GitHub Actions 会自动部署！

```bash
git add .
git commit -m "Update feature"
git push
```

然后：
1. 打开 GitHub 仓库页面
2. 点击顶部的 **Actions** 标签
3. 查看部署进度

### 手动触发部署

1. 进入 GitHub 仓库的 **Actions** 页面
2. 点击左侧的 **🚀 Deploy to Aliyun Server**
3. 点击右侧的 **Run workflow**
4. 选择 `main` 分支
5. 点击绿色的 **Run workflow** 按钮

---

## 📊 查看部署状态

### 在 GitHub 上查看

1. 进入仓库的 **Actions** 页面
2. 点击最新的 workflow run
3. 查看每个步骤的日志

### 部署成功的标志

看到绿色的 ✅ 和：
```
✅ Deployment completed!
🎉 Deployment finished successfully!
```

### 部署失败怎么办？

1. 点击失败的步骤查看错误信息
2. 常见问题：
   - ❌ SSH 连接失败 → 检查私钥是否正确
   - ❌ Git pull 失败 → 检查服务器上是否有未提交的修改
   - ❌ npm install 失败 → 检查 package.json 是否有错误
   - ❌ PM2 重启失败 → 检查后端代码是否有语法错误

---

## 🎨 工作流程文件说明

配置文件位置：`.github/workflows/deploy.yml`

### 触发条件

```yaml
on:
  push:
    branches:
      - main        # Push 到 main 分支时自动部署
  workflow_dispatch:  # 支持手动触发
```

### 部署步骤

1. **📥 Checkout code** - 检出代码
2. **🔐 Setup SSH** - 设置 SSH 连接
3. **🌐 Add server to known hosts** - 添加服务器到信任列表
4. **🚀 Deploy to server** - 执行部署命令
5. **📊 Deployment status** - 显示部署状态

---

## 💡 自定义部署脚本

### 修改部署步骤

编辑 `.github/workflows/deploy.yml` 文件：

```yaml
- name: 🚀 Deploy to server
  run: |
    ssh root@8.130.74.146 << 'EOF'
      # 在这里添加你的部署命令
      cd /www/wwwroot/ai-novel-assistant
      git pull
      npm install
      pm2 restart all
    EOF
```

### 添加环境变量

```yaml
env:
  NODE_ENV: production
  API_URL: https://your-api.com
```

### 添加测试步骤

```yaml
- name: 🧪 Run tests
  run: |
    npm test
```

---

## 🔔 通知集成（可选）

### 部署成功后发送通知

可以集成：
- 钉钉机器人
- 企业微信
- Slack
- 邮件通知

示例（钉钉）：

```yaml
- name: 📢 Send notification
  if: success()
  run: |
    curl 'https://oapi.dingtalk.com/robot/send?access_token=YOUR_TOKEN' \
      -H 'Content-Type: application/json' \
      -d '{
        "msgtype": "text",
        "text": {
          "content": "✅ 部署成功！"
        }
      }'
```

---

## 🆘 常见问题

### Q1: 部署很慢怎么办？

**优化方法**：
1. 使用 npm ci 代替 npm install
2. 启用缓存（cache dependencies）
3. 只构建必要的文件

### Q2: 如何回滚到上一个版本？

在服务器上运行：
```bash
cd /www/wwwroot/ai-novel-assistant
git log --oneline  # 查看提交历史
git reset --hard <commit-id>  # 回滚到指定版本
pm2 restart all
```

### Q3: 如何部署到多个服务器？

在 workflow 中添加多个部署步骤：

```yaml
- name: Deploy to Server 1
  run: ssh user@server1 "cd /path && git pull && pm2 restart app"

- name: Deploy to Server 2
  run: ssh user@server2 "cd /path && git pull && pm2 restart app"
```

---

## ✅ 最佳实践

### 推荐做法

- ✅ 使用 Git 标签管理版本
- ✅ 在部署前运行自动化测试
- ✅ 保留部署日志
- ✅ 设置部署失败通知
- ✅ 定期清理旧的 workflow runs

### 安全建议

- 🔒 不要在代码中硬编码密码
- 🔒 使用 GitHub Secrets 存储敏感信息
- 🔒 定期更换 SSH 密钥
- 🔒 限制 SSH 密钥的权限

---

## 🎉 享受自动化部署！

现在你只需要：
1. 在本地修改代码
2. `git push`
3. GitHub Actions 自动部署
4. 喝杯咖啡 ☕
5. 部署完成！✅

**真正的持续集成/持续部署（CI/CD）！** 🚀

