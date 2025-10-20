import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { selectOne, insert } from '../database/memoryDB.js'

const router = express.Router()

/**
 * 用户注册
 * POST /api/auth/register
 */
router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body

    // 验证输入
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' })
    }

    // 检查用户是否已存在
    const existingUser = selectOne('users', { username })
    if (existingUser) {
      return res.status(400).json({ error: '用户名已存在' })
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10)

    // 插入用户
    const result = insert('users', { username, password: hashedPassword, email })

    res.status(201).json({
      message: '注册成功',
      userId: result.lastInsertRowid
    })
  } catch (error) {
    console.error('注册错误:', error)
    res.status(500).json({ error: '注册失败' })
  }
})

/**
 * 用户登录
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    // MVP 版本：简化登录，任何用户名密码都可以登录
    // 如果用户不存在就创建一个
    let user = selectOne('users', { username })
    
    if (!user) {
      // 自动注册新用户
      const hashedPassword = await bcrypt.hash(password, 10)
      const result = insert('users', { username, password: hashedPassword })
      user = { id: result.lastInsertRowid, username }
    }

    // 生成 JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '7d' }
    )

    res.json({
      message: '登录成功',
      token,
      user: {
        id: user.id,
        username: user.username
      }
    })
  } catch (error) {
    console.error('登录错误:', error)
    res.status(500).json({ error: '登录失败' })
  }
})

/**
 * 验证 token
 * GET /api/auth/verify
 */
router.get('/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    
    if (!token) {
      return res.status(401).json({ error: '未提供 token' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret')
    res.json({ valid: true, user: decoded })
  } catch (error) {
    res.status(401).json({ valid: false, error: 'token 无效' })
  }
})

export default router

