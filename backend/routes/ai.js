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
import { generateStealthContent } from '../services/ai-stealth-service.js'
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
    console.log('📝 生成模式:', previousContent ? '续写模式（有上下文）' : '独立生成模式（无上下文）')
    console.log('📏 上下文长度:', previousContent.length, '字符')

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

/**
 * AI 讨论文本
 * POST /api/ai/discuss
 * 
 * 请求体：
 * {
 *   selectedText: string,   // 选中的文本
 *   novelContext: string    // 章节上下文（可选）
 * }
 */
router.post('/discuss', async (req, res) => {
  try {
    console.log('💬 收到 AI 讨论请求')
    
    const { selectedText, novelContext = '' } = req.body
    
    if (!selectedText || selectedText.trim() === '') {
      return res.status(400).json({
        success: false,
        error: '选中的文本不能为空'
      })
    }
    
    console.log('📝 选中文本长度:', selectedText.length, '字符')
    
    // 构建讨论prompt
    let prompt = '# 文本分析任务\n\n'
    prompt += '你是一位专业的小说编辑和文学评论家，请分析以下文本。\n\n'
    prompt += '## 选中的文本\n'
    prompt += '```\n'
    prompt += selectedText
    prompt += '\n```\n\n'
    
    prompt += '## 分析维度\n'
    prompt += '请从以下角度分析这段文字：\n'
    prompt += '1. **写作技巧**：叙事手法、修辞运用、节奏控制\n'
    prompt += '2. **知识点**：涉及的专业知识、历史背景、文化要素\n'
    prompt += '3. **设定分析**：人物性格、场景描写、情节合理性\n'
    prompt += '4. **改进建议**：可以优化的地方、值得保留的亮点\n\n'
    prompt += '请用简洁清晰的语言进行分析，每个维度2-3句话即可。\n'
    
    console.log('\n📄 讨论Prompt长度:', prompt.length, '字符')
    
    // 直接调用AI（不使用generateNovelContent包装）
    const { callVertexAI } = await import('../services/ai-service.js')
    const { getCurrentAIConfig } = await import('../config/api-config.js')
    
    const aiConfig = getCurrentAIConfig()
    const result = await callVertexAI(prompt, aiConfig)
    
    console.log('✅ 讨论完成')
    console.log('📊 Token消耗:', result.usage.totalTokens)
    
    res.json({
      success: true,
      discussion: result.content,
      usage: result.usage
    })
    
  } catch (error) {
    console.error('❌ 讨论失败:', error.message)
    res.status(500).json({
      success: false,
      error: error.message || '讨论失败'
    })
  }
})

/**
 * AI 修改文本
 * POST /api/ai/rewrite
 * 
 * 请求体：
 * {
 *   originalText: string,   // 原文
 *   instruction: string,    // 修改指令
 *   mode: string,           // 模式：expand/shrink/rewrite
 *   targetWords: number     // 目标字数
 * }
 */
router.post('/rewrite', async (req, res) => {
  try {
    console.log('✏️  收到 AI 修改请求')
    
    const { originalText, instruction, mode = 'rewrite', targetWords = 100 } = req.body
    
    if (!originalText || originalText.trim() === '') {
      return res.status(400).json({
        success: false,
        error: '原文不能为空'
      })
    }
    
    if (!instruction || instruction.trim() === '') {
      return res.status(400).json({
        success: false,
        error: '修改指令不能为空'
      })
    }
    
    console.log('📝 原文长度:', originalText.length, '字符')
    console.log('🎯 修改模式:', mode)
    console.log('📏 目标字数:', targetWords, '字符')
    console.log('💡 修改指令:', instruction.substring(0, 50) + '...')
    
    // 构建修改prompt
    let prompt = '# 文本修改任务\n\n'
    
    // 根据模式添加不同的说明
    if (mode === 'expand') {
      prompt += '## 任务：扩写\n'
      prompt += `请将以下文本扩写到约 ${targetWords} 字。\n\n`
      prompt += '**扩写要求**：\n'
      prompt += '- 增加细节描写、心理活动、环境描写\n'
      prompt += '- 保持原文的所有情节和对话\n'
      prompt += '- 扩充的内容要自然流畅\n\n'
    } else if (mode === 'shrink') {
      prompt += '## 任务：缩写\n'
      prompt += `请将以下文本缩写到约 ${targetWords} 字。\n\n`
      prompt += '**缩写要求**：\n'
      prompt += '- 保留核心情节和重要对话\n'
      prompt += '- 删除冗余的描写和修饰\n'
      prompt += '- 保持文本连贯性\n\n'
    } else {
      prompt += '## 任务：改写\n'
      prompt += `请改写以下文本，保持字数在 ${targetWords} 字左右。\n\n`
      prompt += '**改写要求**：\n'
      prompt += '- 保持原文的核心内容和情节\n'
      prompt += '- 改变表达方式和句式结构\n'
      prompt += '- 字数上下浮动不超过10%\n\n'
    }
    
    prompt += '## 原文\n'
    prompt += '```\n'
    prompt += originalText
    prompt += '\n```\n\n'
    
    prompt += '## 修改指令\n'
    prompt += instruction + '\n\n'
    
    prompt += '## 输出要求\n'
    prompt += '- 直接输出修改后的文本，不要添加任何说明或评论\n'
    prompt += '- 保持原文的文风和语气\n'
    prompt += `- 严格控制字数在 ${targetWords} 字左右\n\n`
    
    prompt += '修改后的文本：\n'
    
    console.log('\n📄 修改Prompt长度:', prompt.length, '字符')
    
    // 计算合理的 maxOutputTokens（关键优化）
    // 中文：1字 ≈ 2-2.5 tokens
    let maxOutputTokens
    if (mode === 'expand') {
      // 扩写：给予充足空间，但有上限
      maxOutputTokens = Math.ceil(targetWords * 2.8)  // 预留更多空间
    } else if (mode === 'shrink') {
      // 缩写：严格限制，强制精简
      maxOutputTokens = Math.ceil(targetWords * 2.2)  // 较紧的限制
    } else {
      // 改写：保持相近
      maxOutputTokens = Math.ceil(targetWords * 2.5)  // 标准比例
    }
    
    console.log('🎯 计算的 maxOutputTokens:', maxOutputTokens)
    
    // 直接调用AI（不使用generateNovelContent包装）
    const { callVertexAI } = await import('../services/ai-service.js')
    const { getCurrentAIConfig, buildVertexAIRequestBody } = await import('../config/api-config.js')
    const { getGoogleAccessToken, getProjectIdFromCredentials } = await import('../services/ai-service.js')
    const axios = (await import('axios')).default
    const { HttpsProxyAgent } = await import('https-proxy-agent')
    
    const aiConfig = getCurrentAIConfig()
    
    // 获取认证信息
    const accessToken = await getGoogleAccessToken(aiConfig.credentialsPath)
    const projectId = aiConfig.projectId || getProjectIdFromCredentials(aiConfig.credentialsPath)
    
    // 构建API端点
    const endpoints = aiConfig.getEndpoint(projectId, aiConfig.location)
    const endpoint = endpoints.generateContent
    
    // 构建请求体（使用自定义的 maxOutputTokens）
    const requestBody = buildVertexAIRequestBody(prompt, {
      temperature: 0.8,  // 适中的随机性
      maxOutputTokens: maxOutputTokens,  // 根据模式动态调整
      topP: 0.95,
      topK: 40
    })
    
    // 配置请求
    const axiosConfig = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      timeout: aiConfig.timeout.response
    }
    
    // 代理配置
    const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY
    if (proxyUrl) {
      axiosConfig.httpsAgent = new HttpsProxyAgent(proxyUrl)
      axiosConfig.proxy = false
    }
    
    // 发送请求
    console.log('🚀 发送修改请求...')
    const response = await axios.post(endpoint, requestBody, axiosConfig)
    
    // 解析响应
    if (!response.data || !response.data.candidates || response.data.candidates.length === 0) {
      throw new Error('API返回数据格式错误或为空')
    }
    
    const candidate = response.data.candidates[0]
    const content = candidate.content?.parts?.[0]?.text || ''
    
    if (!content) {
      throw new Error('API未返回有效内容')
    }
    
    // 提取token使用信息
    const usage = {
      promptTokens: response.data.usageMetadata?.promptTokenCount || 0,
      completionTokens: response.data.usageMetadata?.candidatesTokenCount || 0,
      totalTokens: response.data.usageMetadata?.totalTokenCount || 0
    }
    
    const result = {
      content: content.trim(),
      usage: usage
    }
    
    console.log('✅ 修改完成')
    console.log('📊 修改后字数:', result.content.length, '字符')
    console.log('📊 Token消耗:', result.usage.totalTokens)
    
    res.json({
      success: true,
      rewrittenText: result.content,
      originalLength: originalText.length,
      newLength: result.content.length,
      usage: result.usage
    })
    
  } catch (error) {
    console.error('❌ 修改失败:', error.message)
    res.status(500).json({
      success: false,
      error: error.message || '修改失败'
    })
  }
})

/**
 * 反检测模式生成小说内容（新功能）
 * POST /api/ai/generate-stealth
 * 
 * 采用多轮API调用策略实现反检测：
 * 1. 第一轮：场景驱动生成
 * 2. 第二轮：风格改写（AI腔→网文腔）
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
 *   content: string,          // 最终生成的内容
 *   usage: {                  // 总Token使用情况
 *     promptTokens: number,
 *     completionTokens: number,
 *     totalTokens: number
 *   },
 *   stealthMode: true,
 *   rounds: {                 // 各轮详情
 *     round1: {...},
 *     round2: {...}
 *   }
 * }
 */
router.post('/generate-stealth', async (req, res) => {
  try {
    console.log('🛡️  收到反检测生成请求')
    
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
    console.log('📝 生成模式:', previousContent ? '续写模式（有上下文）' : '独立生成模式（无上下文）')
    console.log('📏 上下文长度:', previousContent.length, '字符')
    console.log('🎯 目标字数:', targetWords, '字')

    // 3. 从数据库获取卡片完整信息
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

    // 4. 调用反检测生成服务
    console.log('🛡️  启动反检测生成服务...')
    const result = await generateStealthContent({
      outline,
      characters,
      items,
      scene,
      previousContent,
      targetWords
    })

    // 5. 返回结果
    console.log('✅ 反检测生成完成')
    res.json(result)

  } catch (error) {
    console.error('❌ 反检测生成失败:', error.message)
    
    // 返回错误信息
    res.status(500).json({
      success: false,
      error: error.message || '生成内容失败，请重试'
    })
  }
})

export default router

