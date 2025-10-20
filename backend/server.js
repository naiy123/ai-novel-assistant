import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import novelRoutes from './routes/novels.js'
import cardRoutes from './routes/cards.js'
import aiRoutes from './routes/ai.js'
import { initDatabase } from './database/memoryDB.js'

// 加载环境变量
dotenv.config()

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

