# 🔌 Cursor Remote SSH 配置指南

## ✨ 直接在服务器上开发，实时测试！

---

## 📦 第 1 步：安装 Remote SSH 扩展

### 在 Cursor 中：

1. 按 `Ctrl + Shift + X` 打开扩展商店
2. 搜索：`Remote - SSH`
3. 安装：**Remote - SSH**（作者：Microsoft）
4. 重启 Cursor

---

## ⚙️ 第 2 步：配置 SSH 连接

### 1. 打开 SSH 配置

按 `Ctrl + Shift + P`，输入：`Remote-SSH: Open SSH Configuration File`

选择：`C:\Users\Administrator\.ssh\config`

### 2. 添加服务器配置

```ssh-config
Host aliyun-novel
    HostName 8.130.74.146
    User root
    Port 22
    IdentityFile ~/.ssh/id_rsa
```

### 3. 保存配置

按 `Ctrl + S` 保存

---

## 🔑 第 3 步：设置 SSH 密钥（可选，避免每次输入密码）

### 在本地 PowerShell 运行：

```powershell
# 生成 SSH 密钥（如果还没有）
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# 复制公钥到服务器
type $env:USERPROFILE\.ssh\id_rsa.pub | ssh root@8.130.74.146 "cat >> ~/.ssh/authorized_keys"
```

---

## 🚀 第 4 步：连接到服务器

### 方法 1：通过命令面板

1. 按 `Ctrl + Shift + P`
2. 输入：`Remote-SSH: Connect to Host`
3. 选择：`aliyun-novel`
4. 等待连接（会打开新窗口）

### 方法 2：通过左下角按钮

1. 点击 Cursor 左下角的绿色按钮
2. 选择：`Connect to Host`
3. 选择：`aliyun-novel`

---

## 🎉 第 5 步：开始开发

### 连接成功后：

1. 点击：`File > Open Folder`
2. 选择：`/www/wwwroot/ai-novel-assistant`
3. 开始编辑代码！

### 优势：

- ✅ 直接在服务器上编辑，无需上传
- ✅ 修改后立即生效
- ✅ 在服务器终端直接运行命令
- ✅ 实时调试和测试

---

## 💡 使用技巧

### 在服务器终端运行命令

按 `` Ctrl + ` `` 打开终端，直接运行：

```bash
# 重启后端
pm2 restart ai-novel-backend

# 重新构建前端
cd frontend && npm run build

# 查看日志
pm2 logs ai-novel-backend
```

### 断开连接

点击左下角的绿色按钮 → 选择 `Close Remote Connection`

---

## 🔧 常见问题

### Q1: 连接超时？

**解决方法**：
1. 检查服务器 IP 是否正确
2. 检查防火墙是否开放 22 端口
3. 尝试用密码连接（不用密钥）

### Q2: 每次都要输入密码？

**解决方法**：按照"第 3 步"设置 SSH 密钥

### Q3: 连接后看不到文件？

**解决方法**：点击 `File > Open Folder`，手动选择项目目录

---

## ⚠️ 注意事项

- ⚠️ 直接在服务器上修改代码时，记得定期提交到 Git
- ⚠️ 不要在 Remote SSH 和本地同时修改同一个文件
- ⚠️ 大文件上传/下载可能较慢

---

## 🎯 推荐工作流程

```
1. 用 Remote SSH 连接服务器
   ↓
2. 直接编辑代码
   ↓
3. 在服务器终端测试
   ↓
4. 确认无误后提交到 Git
   ↓
5. Push 到 GitHub
```

这样就不需要本地和服务器来回同步了！

