import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import novelRoutes from './routes/novels.js'
import cardRoutes from './routes/cards.js'
import aiRoutes from './routes/ai.js'
import { initDatabase } from './database/sqlite.js'

// ES Module 环境下获取 __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 加载环境变量
dotenv.config()

// 处理 Railway/Vercel 等平台的 Google Cloud 密钥
// 从环境变量 GOOGLE_APPLICATION_CREDENTIALS_JSON 读取 JSON 内容并写入文件
if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  console.log('🔑 检测到环境变量中的 Google Cloud 密钥，正在写入文件...')
  
  const credentialsDir = path.join(__dirname, 'credentials')
  const credentialsPath = path.join(credentialsDir, 'google-cloud-key.json')
  
  try {
    // 确保 credentials 目录存在
    if (!fs.existsSync(credentialsDir)) {
      fs.mkdirSync(credentialsDir, { recursive: true })
      console.log('✅ 创建 credentials 目录')
    }
    
    // 写入密钥文件
    fs.writeFileSync(credentialsPath, process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON)
    console.log('✅ Google Cloud 密钥文件已写入:', credentialsPath)
    
    // 设置环境变量供 Google Auth Library 使用
    process.env.GOOGLE_APPLICATION_CREDENTIALS = credentialsPath
    console.log('✅ GOOGLE_APPLICATION_CREDENTIALS 环境变量已设置')
  } catch (error) {
    console.error('❌ 写入 Google Cloud 密钥文件失败:', error.message)
    process.exit(1)
  }
} else if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.log('⚠️  未检测到 Google Cloud 密钥配置')
  console.log('   请设置 GOOGLE_APPLICATION_CREDENTIALS 或 GOOGLE_APPLICATION_CREDENTIALS_JSON')
}

// 创建 Express 应用
const app = express()
const PORT = process.env.PORT || 5000

// 中间件配置
app.use(cors()) // 允许跨域请求
app.use(express.json()) // 解析 JSON 请求体
app.use(express.urlencoded({ extended: true })) // 解析 URL 编码的请求体

// 初始化数据库
initDatabase()

// 路由配置
app.use('/api/auth', authRoutes) // 用户认证相关
app.use('/api/novels', novelRoutes) // 小说管理相关
app.use('/api/cards', cardRoutes) // 卡片管理相关
app.use('/api/ai', aiRoutes) // AI 写作相关

// 根路径
app.get('/', (req, res) => {
  res.json({
    message: '欢迎使用 AI 小说写作助手 API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      novels: '/api/novels',
      cards: '/api/cards',
      ai: '/api/ai'
    }
  })
})

// 404 处理
app.use((req, res) => {
  res.status(404).json({ error: '接口不存在' })
})

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器错误:', err)
  res.status(500).json({ error: '服务器内部错误' })
})

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`)
  console.log(`📚 API 文档：http://localhost:${PORT}`)
})

