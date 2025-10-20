/**
 * AI 写作路由
 * 
 * 作用：
 * 1. 接收前端的 AI 生成请求
 * 2. 从数据库获取卡片信息
 * 3. 调用 AI 服务生成内容
 * 4. 返回结果给前端
 */

import express from 'express'
import { generateNovelContent, testConnection } from '../services/ai-service.js'
import { selectAll } from '../database/memoryDB.js'

const router = express.Router()

/**
 * 生成小说内容
 * POST /api/ai/generate
 * 
 * 请求体：
 * {
 *   outline: string,          // 剧情大纲（必填）
 *   characterIds: number[],   // 人物卡 ID 列表（可选）
 *   itemIds: number[],        // 物品卡 ID 列表（可选）
 *   sceneId: number,          // 场景卡 ID（可选）
 *   previousContent: string,  // 之前的内容（可选）
 *   targetWords: number       // 目标字数（可选，默认 2000）
 * }
 * 
 * 响应：
 * {
 *   success: boolean,
 *   content: string,          // 生成的内容
 *   usage: {                  // Token 使用情况
 *     promptTokens: number,
 *     completionTokens: number,
 *     totalTokens: number
 *   },
 *   model: string             // 使用的模型名称
 * }
 */
router.post('/generate', async (req, res) => {
  try {
    console.log('📝 收到 AI 生成请求')
    
    // 1. 获取请求参数
    const {
      outline,
      characterIds = [],
      itemIds = [],
      sceneId = null,
      previousContent = '',
      targetWords = 2000
    } = req.body

    // 2. 验证必填参数
    if (!outline || outline.trim() === '') {
      return res.status(400).json({
        success: false,
        error: '剧情大纲不能为空'
      })
    }

    console.log('📋 剧情大纲:', outline.substring(0, 50) + '...')
    console.log('👥 人物卡数量:', characterIds.length)
    console.log('⚔️ 物品卡数量:', itemIds.length)
    console.log('🏰 场景卡:', sceneId ? '已选择' : '未选择')

    // 3. 从数据库获取卡片完整信息
    // 使用 novelId=1 作为作者级别卡片（实际应该是 userId）
    const novelId = 1

    // 获取人物卡
    let characters = []
    if (characterIds.length > 0) {
      const allCharacters = selectAll('characterCards', { novel_id: novelId })
      characters = allCharacters.filter(char => characterIds.includes(char.id))
      console.log('✅ 获取到人物卡:', characters.map(c => c.name).join(', '))
    }

    // 获取物品卡
    let items = []
    if (itemIds.length > 0) {
      const allItems = selectAll('itemCards', { novel_id: novelId })
      items = allItems.filter(item => itemIds.includes(item.id))
      console.log('✅ 获取到物品卡:', items.map(i => i.name).join(', '))
    }

    // 获取场景卡
    let scene = null
    if (sceneId) {
      const allScenes = selectAll('sceneCards', { novel_id: novelId })
      scene = allScenes.find(s => s.id === sceneId)
      console.log('✅ 获取到场景卡:', scene ? scene.name : '未找到')
    }

    // 4. 调用 AI 服务生成内容
    console.log('🤖 开始调用 AI 服务...')
    const result = await generateNovelContent({
      outline,
      characters,
      items,
      scene,
      previousContent,
      targetWords
    })

    // 5. 返回结果
    console.log('✅ 生成完成，返回结果')
    res.json(result)

  } catch (error) {
    console.error('❌ 生成失败:', error.message)
    
    // 返回错误信息
    res.status(500).json({
      success: false,
      error: error.message || '生成内容失败，请重试'
    })
  }
})

/**
 * 测试 AI 连接
 * GET /api/ai/test
 * 
 * 用于验证 AI API 配置是否正确
 * 
 * 响应：
 * {
 *   success: boolean,
 *   message: string,
 *   model: string,
 *   response: string
 * }
 */
router.get('/test', async (req, res) => {
  try {
    console.log('🧪 测试 AI 连接...')
    
    const result = await testConnection()
    
    if (result.success) {
      console.log('✅ 连接测试成功')
      res.json(result)
    } else {
      console.log('❌ 连接测试失败:', result.message)
      res.status(500).json(result)
    }

  } catch (error) {
    console.error('❌ 测试失败:', error.message)
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
})

/**
 * 获取 AI 配置信息（不包含密钥）
 * GET /api/ai/config
 * 
 * 用于前端显示当前使用的 AI 服务信息
 * 
 * 响应：
 * {
 *   service: string,      // 服务名称
 *   model: string,        // 模型名称
 *   configured: boolean   // 是否已配置
 * }
 */
router.get('/config', async (req, res) => {
  try {
    // 动态导入配置
    const { getCurrentAIConfig } = await import('../config/api-config.js')
    
    try {
      const config = getCurrentAIConfig()
      
      res.json({
        service: config.name,
        model: config.model.name,
        configured: !!config.apiKey,
        parameters: {
          temperature: config.parameters.temperature,
          maxOutputTokens: config.parameters.maxOutputTokens
        }
      })
    } catch (error) {
      res.json({
        service: 'unknown',
        model: 'unknown',
        configured: false,
        error: error.message
      })
    }

  } catch (error) {
    console.error('获取配置失败:', error.message)
    res.status(500).json({
      error: '获取配置失败'
    })
  }
})

export default router

