# Google Cloud Vertex AI 配置指南

## 📋 概述

本指南将帮助你配置 Google Cloud 服务账号，以便使用 Vertex AI API 进行 AI 小说创作。

## 🎯 快速开始（5 步完成）

### 步骤 1：准备 Google Cloud 项目

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 登录你的 Google 账号
3. 创建新项目或选择现有项目
   - 点击顶部的项目选择器
   - 点击 "新建项目"
   - 输入项目名称，例如："ai-novel-writer"
   - 点击 "创建"

### 步骤 2：启用 Vertex AI API

1. 在 Google Cloud Console 中，打开左侧菜单
2. 选择 "API 和服务" > "库"
3. 搜索 "Vertex AI API"
4. 点击 "Vertex AI API"
5. 点击 "启用" 按钮
6. 等待几秒钟，直到 API 启用完成

### 步骤 3：创建服务账号

1. 在左侧菜单中，选择 "IAM 和管理" > "服务账号"
2. 点击顶部的 "+ 创建服务账号"
3. 填写服务账号信息：
   - **服务账号名称**：`ai-novel-service`
   - **服务账号 ID**：自动生成（如 `ai-novel-service@your-project.iam.gserviceaccount.com`）
   - **描述**：AI 小说写作服务账号
4. 点击 "创建并继续"

### 步骤 4：授予权限

在 "向此服务账号授予对项目的访问权限" 页面：

1. 点击 "选择角色" 下拉菜单
2. 搜索并选择 **"Vertex AI User"** 角色
3. 点击 "继续"
4. 点击 "完成"

### 步骤 5：生成并下载密钥

1. 在服务账号列表中，找到刚创建的服务账号
2. 点击服务账号邮箱进入详情页
3. 切换到 "密钥" 标签
4. 点击 "添加密钥" > "创建新密钥"
5. 选择密钥类型：**JSON**
6. 点击 "创建"
7. JSON 密钥文件将自动下载到你的电脑

**重要**：妥善保管这个 JSON 文件，不要泄露给他人！

---

## 📁 配置项目

### 1. 放置密钥文件

将下载的 JSON 密钥文件放到项目中：

```
backend/
  └── credentials/
      └── google-cloud-key.json  ← 将 JSON 文件重命名并放在这里
```

**步骤**：

```bash
# 在项目根目录执行
mkdir -p backend/credentials
# 将下载的 JSON 文件复制到此目录并重命名为 google-cloud-key.json
```

### 2. 配置环境变量

后端的 `.env` 文件已经配置好了：

```bash
# backend/.env
GOOGLE_APPLICATION_CREDENTIALS=credentials/google-cloud-key.json
VERTEX_AI_LOCATION=us-central1
```

**说明**：
- `GOOGLE_APPLICATION_CREDENTIALS`：指向 JSON 密钥文件的路径
- `VERTEX_AI_LOCATION`：API 区域，推荐使用 `us-central1`
- 项目 ID 会自动从 JSON 文件读取，无需手动配置

---

## 🧪 测试配置

运行测试脚本验证配置：

```bash
cd backend
node test-vertex-ai.js
```

**期望输出**：

```
🧪 Vertex AI 连接测试脚本
============================================================

📋 步骤 1: 检查配置文件
------------------------------------------------------------
📁 密钥文件路径: C:\...\backend\credentials\google-cloud-key.json
✅ 密钥文件存在

密钥文件信息：
- 类型: service_account
- 项目 ID: your-project-id
- 客户端邮箱: ai-novel-service@your-project.iam.gserviceaccount.com
- 私钥 ID: 12345678...

📋 步骤 2: 测试获取访问令牌
------------------------------------------------------------
🔐 正在获取访问令牌...
✅ 访问令牌获取成功
- 令牌前缀: ya29.c.c0ASRK0Gb8j...
- 令牌长度: 182 字符

📋 步骤 3: 测试 AI 服务连接
------------------------------------------------------------
🧪 调用 testConnection()...

✅ 连接测试成功！

响应信息：
- 模型: gemini-2.0-flash-exp
- AI 回复: 测试成功
- Token 使用:
  · 输入: 15
  · 输出: 5
  · 总计: 20

📋 步骤 4: 测试内容生成
------------------------------------------------------------
测试数据：
- 剧情大纲: 主角在古老的图书馆中发现了一本神秘的魔法书...
...

✅ 生成成功！

🎉 所有测试通过！
```

---

## ❌ 常见错误和解决方案

### 错误 1：密钥文件不存在

```
❌ 密钥文件不存在: backend/credentials/google-cloud-key.json
```

**解决方案**：
1. 确认 JSON 密钥文件已下载
2. 确认文件路径正确：`backend/credentials/google-cloud-key.json`
3. 确认文件名正确（包括扩展名 `.json`）

### 错误 2：API 权限不足

```
❌ API 权限不足: Permission 'aiplatform.endpoints.predict' denied
```

**解决方案**：
1. 确认服务账号已授予 "Vertex AI User" 角色
2. 等待几分钟让权限生效
3. 重新运行测试脚本

### 错误 3：API 未启用

```
❌ API 端点不存在: Vertex AI API has not been used in project...
```

**解决方案**：
1. 确认已在 Google Cloud Console 中启用 Vertex AI API
2. 访问 [API 库](https://console.cloud.google.com/apis/library)
3. 搜索并启用 "Vertex AI API"
4. 等待几分钟让 API 启用生效

### 错误 4：项目未启用计费

```
❌ Project XXX has not enabled billing
```

**解决方案**：
1. 访问 [计费设置](https://console.cloud.google.com/billing)
2. 为项目启用计费账号
3. 注意：Vertex AI 需要绑定信用卡，但 `gemini-2.0-flash-exp` 模型是免费的

### 错误 5：无法获取访问令牌

```
❌ 获取访问令牌失败: invalid_grant
```

**解决方案**：
1. 确认 JSON 密钥文件格式正确
2. 确认服务账号未被删除或禁用
3. 重新下载密钥文件并替换

---

## 🌍 区域选择

### 推荐区域

| 区域 | 代码 | 延迟 | 说明 |
|------|------|------|------|
| 美国中部 | `us-central1` | 低 | 推荐，稳定性最好 |
| 美国东部 | `us-east4` | 低 | 备选 |
| 亚太东北1（东京） | `asia-northeast1` | 中 | 亚洲用户可选 |
| 欧洲西部 | `europe-west1` | 中 | 欧洲用户可选 |

### 修改区域

在 `backend/.env` 中修改：

```bash
VERTEX_AI_LOCATION=asia-northeast1  # 改为其他区域
```

---

## 💰 费用说明

### gemini-2.0-flash-exp（当前使用）

- **费用**：**完全免费**（实验性模型）
- **限制**：每分钟 15 次请求
- **适用**：开发和测试

### gemini-1.5-pro（生产环境）

如果需要更稳定的生产版本，可以切换到 `gemini-1.5-pro`：

在 `backend/config/api-config.js` 中修改：

```javascript
model: {
  name: 'gemini-1.5-pro',
  fullPath: 'publishers/google/models/gemini-1.5-pro'
}
```

**费用**（参考）：
- 输入：$0.00025 / 1K tokens
- 输出：$0.00075 / 1K tokens

**示例**：生成 2000 字内容约 $0.005（约 0.03 元人民币）

---

## 🔒 安全最佳实践

### 1. 保护密钥文件

❌ **不要做**：
- 将 JSON 密钥文件提交到 Git
- 在公共场合分享密钥
- 在前端代码中使用密钥

✅ **应该做**：
- 将 `credentials/` 目录添加到 `.gitignore`
- 定期轮换服务账号密钥
- 只在后端服务器使用密钥

### 2. 限制服务账号权限

只授予必需的权限：
- ✅ Vertex AI User（必需）
- ❌ 避免授予 Owner 或 Editor 等高权限角色

### 3. 监控使用情况

定期检查：
1. API 调用次数
2. Token 使用量
3. 费用账单
4. 异常访问日志

---

## 🎓 高级配置

### 使用多个服务账号

为不同环境创建不同的服务账号：

```bash
# 开发环境
GOOGLE_APPLICATION_CREDENTIALS=credentials/dev-key.json

# 生产环境
GOOGLE_APPLICATION_CREDENTIALS=credentials/prod-key.json
```

### 使用环境变量

也可以直接设置环境变量（不推荐）：

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/key.json"
```

### 配置超时和重试

在 `backend/config/api-config.js` 中调整：

```javascript
timeout: {
  connect: 10000,   // 连接超时（毫秒）
  response: 120000  // 响应超时（毫秒）
},

retry: {
  maxRetries: 3,       // 最大重试次数
  retryDelay: 1000,    // 重试延迟（毫秒）
  backoffFactor: 2     // 延迟倍增因子
}
```

---

## 📚 相关文档

- [Google Cloud 控制台](https://console.cloud.google.com/)
- [Vertex AI 文档](https://cloud.google.com/vertex-ai/docs)
- [服务账号密钥管理](https://cloud.google.com/iam/docs/keys-create-delete)
- [Vertex AI 定价](https://cloud.google.com/vertex-ai/pricing)

---

## 🆘 获取帮助

如果遇到问题：

1. **检查测试输出**：运行 `node test-vertex-ai.js` 查看详细错误信息
2. **查看日志**：后端控制台会输出详细的请求和响应日志
3. **验证配置**：确认所有步骤都已正确完成
4. **检查权限**：确认服务账号有足够的权限
5. **查看文档**：参考 Google Cloud 官方文档

---

## ✅ 验收清单

完成以下步骤，说明配置成功：

- [ ] 创建了 Google Cloud 项目
- [ ] 启用了 Vertex AI API
- [ ] 创建了服务账号并授予权限
- [ ] 下载了 JSON 密钥文件
- [ ] 将密钥文件放在 `backend/credentials/google-cloud-key.json`
- [ ] 配置了环境变量
- [ ] 运行 `node test-vertex-ai.js` 显示 "所有测试通过"
- [ ] 在应用中成功生成了 AI 内容

---

**配置完成！现在你可以使用 AI 写作功能了！** 🎉

返回 [快速开始指南](./AI功能快速开始.md) 继续使用应用。


