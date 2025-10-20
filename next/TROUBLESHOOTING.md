# 🔧 故障排查指南

## 问题：卡在"生成中..."

### 可能原因

1. **网络连接问题**
   - 国内访问 Google API 可能需要科学上网
   - 防火墙拦截

2. **API 响应慢**
   - Gemini API 服务器响应延迟
   - 提示词过长导致生成时间长

3. **流式响应解析问题**
   - 响应格式不符合预期
   - JSON 解析失败

### 诊断步骤

#### 步骤1：检查浏览器控制台

按 `F12` 打开开发者工具，查看 Console 标签页。

**正常日志应该是：**
```
📝 提示词长度: 245
📝 提示词预览: 你是一位专业的网络小说作家...
📡 开始调用 Gemini API...
🔗 API URL: https://aiplatform.googleapis.com/...
✅ API 响应状态: 200 OK
📥 开始读取流式响应...
📝 已生成: 10 字
📝 已生成: 25 字
📝 已生成: 50 字
...
📦 流式响应结束，共收到 15 个数据块
✅ 生成完成，总字数: 523
```

**如果卡住，检查日志停在哪里：**

- **停在"开始调用 Gemini API..."**
  → 网络连接问题，无法访问 Google API

- **停在"开始读取流式响应..."**
  → API 已响应，但流式读取卡住

- **看到"⚠️ 跳过非JSON行"**
  → 响应格式异常，可能是 API 端点问题

#### 步骤2：检查 Network 标签

1. 在开发者工具中，点击 `Network` 标签
2. 点击"生成"按钮
3. 找到 `streamGenerateContent` 请求
4. 查看状态码：

- **200 OK** → API 调用成功，问题在流式解析
- **400 Bad Request** → API Key 或请求格式错误
- **429 Too Many Requests** → 配额耗尽
- **Pending...** → 网络连接问题

#### 步骤3：测试 API 连接

在控制台运行以下代码（替换 YOUR_API_KEY）：

```javascript
fetch('https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-2.5-pro:streamGenerateContent?key=YOUR_API_KEY', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ role: 'user', parts: [{ text: 'Hi' }] }]
  })
})
.then(r => {
  console.log('状态:', r.status);
  return r.text();
})
.then(t => console.log('响应:', t))
.catch(e => console.error('错误:', e));
```

### 解决方案

#### 方案1：等待超时

- 当前设置了 **60秒超时**
- 如果60秒后还没响应，会自动显示超时错误
- 可以重新尝试生成

#### 方案2：减少提示词长度

如果提示词过长（>5000字），尝试：
- 精简故事背景
- 减少角色描述
- 缩短剧情说明

#### 方案3：检查网络

**国内用户：**
- 确保科学上网工具正常运行
- 尝试切换节点
- 测试能否访问 https://aistudio.google.com/

**测试命令（PowerShell）：**
```powershell
Test-NetConnection -ComputerName aiplatform.googleapis.com -Port 443
```

#### 方案4：使用其他模型

如果 `gemini-2.5-pro` 响应慢，尝试更快的模型。

修改 `page.tsx` 第 65 行：

```typescript
// 从这个
const apiUrl = `https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-2.5-pro:streamGenerateContent?key=${apiKey}`;

// 改为
const apiUrl = `https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-2.5-flash-lite:streamGenerateContent?key=${apiKey}`;
```

`gemini-2.5-flash-lite` 速度更快但质量略低。

#### 方案5：刷新页面

有时候状态卡住是因为 React 状态异常：
1. 按 `Ctrl + Shift + R` 强制刷新页面
2. 清除浏览器缓存
3. 重新输入参数并生成

---

## 问题：显示 API Key 错误

### 错误信息
```
API 错误 (400): API key not valid. Please pass a valid API key.
```

### 解决方案

1. **检查 API Key 格式**
   - 正确格式：`AIzaSy...`（以 AIza 开头）
   - 长度约 39 个字符

2. **重新复制 API Key**
   - 访问：https://aistudio.google.com/app/apikey
   - 点击"Copy"而不是手动选择
   - 确保没有多余空格或换行

3. **确认 API Key 来源**
   - 必须来自 **Google AI Studio**
   - 不是 Google Cloud Console 的 API Key

---

## 问题：429 配额耗尽

### 错误信息
```
Resource exhausted. Please try again later.
```

### 说明

**好消息：** API Key 有效！只是配额用完了。

### 免费版限制

- ⏱️ 每分钟 15 次请求
- 📅 每天 1,500 次请求

### 解决方案

1. **等待几分钟**
   - 每分钟限制重置很快
   - 建议等待 5 分钟后重试

2. **检查配额使用**
   - 访问：https://aistudio.google.com/
   - 查看今日剩余配额

3. **升级到付费版**
   - 如需更高配额，可升级

---

## 问题：生成内容为空

### 可能原因

1. **Gemini 返回了空响应**
2. **JSON 解析全部失败**
3. **网络中断**

### 诊断

查看控制台：
```
📦 流式响应结束，共收到 0 个数据块
✅ 生成完成，总字数: 0
```

如果看到这个，说明 API 返回了响应，但没有内容。

### 解决方案

1. **检查提示词**
   - 确保至少填写了一项参数
   - 尝试填写更详细的剧情

2. **换个提示词**
   - 有时 AI 拒绝生成某些内容
   - 尝试更换剧情描述

3. **重新生成**
   - 点击"开始生成"重试

---

## 问题：生成速度很慢

### 正常速度

- 开始响应：2-5 秒
- 生成 500 字：10-20 秒
- 总时长：15-30 秒

### 如果超过 1 分钟

1. **检查网络延迟**
   ```powershell
   ping aiplatform.googleapis.com
   ```

2. **换用 Flash 模型**
   - 更快但质量略低
   - 修改 API URL（见上文）

3. **减少输出长度**
   - 修改提示词中的"500字左右"为"300字左右"

---

## 调试技巧

### 1. 启用详细日志

当前代码已包含详细日志，在控制台查看：
- 📝 提示词信息
- 📡 API 调用
- 📥 流式响应
- 📦 数据块统计
- ✅ 完成状态

### 2. 手动测试 API

使用 curl 命令（PowerShell）：

```powershell
$apiKey = "YOUR_API_KEY"
$url = "https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-2.5-pro:streamGenerateContent?key=$apiKey"

$body = @{
  contents = @(
    @{
      role = "user"
      parts = @(@{ text = "测试" })
    }
  )
} | ConvertTo-Json -Depth 5

Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType "application/json"
```

### 3. 检查响应格式

如果生成卡住，在 Network 标签中：
1. 找到 `streamGenerateContent` 请求
2. 点击 `Response` 标签
3. 查看实际返回的内容

---

## 常见错误速查

| 错误信息 | 原因 | 解决方法 |
|---------|------|---------|
| `API key not valid` | API Key 错误 | 重新复制 API Key |
| `Resource exhausted (429)` | 配额耗尽 | 等待几分钟或升级 |
| `Failed to fetch` | 网络问题 | 检查网络或科学上网 |
| `生成超时（60秒）` | 响应太慢 | 检查网络或换模型 |
| `无法读取响应流` | 浏览器不支持 | 更新浏览器 |
| `生成中断` | 网络中断 | 重新生成 |

---

## 联系支持

如果以上方法都无法解决：

1. **记录错误信息**
   - 截图控制台日志
   - 复制完整错误消息

2. **提供环境信息**
   - 浏览器版本
   - 操作系统
   - 是否使用代理

3. **提供复现步骤**
   - 输入的参数
   - 点击的按钮
   - 出现问题的时间点

---

**祝你顺利解决问题！** 🚀


