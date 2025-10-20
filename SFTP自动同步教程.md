# 🚀 SFTP 自动同步教程（最简单方案）

## ✨ 设置一次，永久自动！

---

## 📋 第 1 步：安装 SFTP 插件

### 在 Cursor 中：

1. 按 `Ctrl + Shift + X` 打开扩展商店
2. 搜索：`SFTP`
3. 安装：**SFTP/FTP sync**（作者：Natizyskunk）
4. 安装后**重启 Cursor**

---

## ⚙️ 第 2 步：配置服务器信息

### 1. 打开配置文件

在 Cursor 中打开：`.vscode/sftp.json`

### 2. 修改密码

找到这一行：
```json
"password": "你的服务器密码",
```

改成你的真实密码，比如：
```json
"password": "Admin@2025",
```

### 3. 保存文件

按 `Ctrl + S` 保存

---

## 🎉 第 3 步：开始使用（就这么简单！）

### 现在，你只需要：

1. **在 Cursor 中编辑代码**
2. **按 `Ctrl + S` 保存**
3. **自动上传到服务器！** ✅

---

## 🔍 如何验证是否同步成功？

### 方法 1：查看 Cursor 底部状态栏

保存文件后，会显示：
```
✓ [SFTP] uploaded /path/to/file
```

### 方法 2：右键文件查看

在 Cursor 的文件资源管理器中：
- 右键任意文件
- 选择 **"SFTP: Upload File"**
- 会显示上传进度

---

## 🎯 常用操作

### 📤 上传整个项目（第一次使用）

1. 在 Cursor 中，打开文件资源管理器
2. 右键项目根目录
3. 选择：**"SFTP: Upload Folder"**
4. 等待上传完成（可能需要几分钟）

### 📥 从服务器下载文件

1. 右键文件或文件夹
2. 选择：**"SFTP: Download File/Folder"**

### 🔄 同步整个项目

1. 右键项目根目录
2. 选择：**"SFTP: Sync Local -> Remote"**

### ❌ 从服务器删除文件

1. 右键文件
2. 选择：**"SFTP: Delete Remote"**

---

## 🛠️ 修改后需要重启的服务

### 后端代码修改后（backend/）

连接到服务器，运行：
```bash
pm2 restart ai-novel-backend
```

### 前端代码修改后（frontend/）

连接到服务器，运行：
```bash
cd /www/wwwroot/ai-novel-assistant/frontend
npm run build
```

**或者，用宝塔面板的终端运行这个简单命令：**
```bash
cd /www/wwwroot/ai-novel-assistant/frontend && npm run build && pm2 restart ai-novel-backend
```

---

## 🎨 **推荐工作流程**

```
1. 在 Cursor 中修改代码
   ↓
2. 按 Ctrl + S 保存（自动上传）
   ↓
3. 打开宝塔面板终端
   ↓
4. 运行一键更新命令：
   bash /www/wwwroot/ai-novel-assistant/update-local.sh
   ↓
5. 刷新浏览器查看效果
```

---

## 🆘 常见问题

### Q1: 保存后没有自动上传？

**解决方法**：
1. 检查 `.vscode/sftp.json` 中的密码是否正确
2. 按 `Ctrl + Shift + P`，输入 `SFTP: Test Connection`
3. 如果连接失败，检查服务器 IP 和端口

### Q2: 上传很慢？

**原因**：可能在上传 `node_modules` 文件夹

**解决方法**：配置文件中已经设置忽略 `node_modules`，如果还是慢：
1. 右键 `node_modules` 文件夹
2. 选择 **"Add to .gitignore"**

### Q3: 修改代码后网站没变化？

**原因**：后端需要重启，前端需要重新构建

**解决方法**：在宝塔终端运行：
```bash
cd /www/wwwroot/ai-novel-assistant/frontend && npm run build && pm2 restart ai-novel-backend
```

---

## 💡 最佳实践

### ✅ 推荐做法

- ✅ 只修改必要的文件
- ✅ 保存后等待上传完成（查看底部状态栏）
- ✅ 修改后端代码后记得重启 PM2
- ✅ 修改前端代码后记得重新构建

### ❌ 避免做法

- ❌ 不要直接在服务器上修改代码
- ❌ 不要同时在多个地方编辑同一个文件
- ❌ 不要上传 `node_modules` 文件夹

---

## 🎉 享受自动化开发！

现在你可以：
- 在 Cursor 中专注写代码
- 保存时自动同步到服务器
- 不需要记任何命令
- 不需要手动上传文件

**真正的一键同步！** ✨

