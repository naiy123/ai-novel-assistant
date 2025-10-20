/**
 * AI 服务调用模块
 * 
 * 作用：
 * 1. 封装对 AI API 的调用
 * 2. 处理请求和响应
 * 3. 错误处理和重试机制
 * 4. 流式响应处理
 * 
 * 使用场景：
 * - 小说续写
 * - 内容生成
 * - 创意扩展
 */

import axios from 'axios'
import { GoogleAuth } from 'google-auth-library'
import { HttpsProxyAgent } from 'https-proxy-agent'
import fs from 'fs'
import { generateFullPrompt } from '../config/prompt-template.js'
import { 
  getCurrentAIConfig, 
  validateConfig, 
  buildVertexAIRequestBody,
  VERTEX_AI_CONFIG 
} from '../config/api-config.js'

/**
 * 获取 Google Cloud 访问令牌
 * 使用服务账号 JSON 密钥文件进行认证
 * 
 * @param {string} credentialsPath - JSON 密钥文件路径
 * @returns {Promise<string>} 访问令牌
 */
async function getGoogleAccessToken(credentialsPath) {
  try {
    // 检查密钥文件是否存在
    if (!fs.existsSync(credentialsPath)) {
      throw new Error(`密钥文件不存在: ${credentialsPath}`)
    }

    // 创建认证客户端
    const auth = new GoogleAuth({
      keyFile: credentialsPath,
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    })

    // 获取访问令牌
    const client = await auth.getClient()
    const token = await client.getAccessToken()
    
    if (!token.token) {
      throw new Error('无法获取访问令牌')
    }

    return token.token
  } catch (error) {
    console.error('获取 Google 访问令牌失败:', error.message)
    throw new Error(`认证失败: ${error.message}`)
  }
}

/**
 * 从 JSON 密钥文件中读取项目 ID
 * 
 * @param {string} credentialsPath - JSON 密钥文件路径
 * @returns {string} 项目 ID
 */
function getProjectIdFromCredentials(credentialsPath) {
  try {
    if (!fs.existsSync(credentialsPath)) {
      throw new Error(`密钥文件不存在: ${credentialsPath}`)
    }

    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'))
    return credentials.project_id
  } catch (error) {
    console.error('读取项目 ID 失败:', error.message)
    throw new Error(`无法读取项目 ID: ${error.message}`)
  }
}

/**
 * 生成小说内容（主函数）
 * 
 * @param {Object} params - 参数对象
 * @param {string} params.outline - 剧情大纲
 * @param {Array} params.characters - 人物卡数组
 * @param {Array} params.items - 物品卡数组
 * @param {Object} params.scene - 场景卡对象
 * @param {string} params.previousContent - 之前的内容（可选）
 * @param {number} params.targetWords - 目标字数（可选）
 * @returns {Promise<Object>} 生成结果
 */
async function generateNovelContent({
  outline,
  characters = [],
  items = [],
  scene = null,
  previousContent = '',
  targetWords = 2000
}) {
  try {
    // 1. 验证输入
    if (!outline || outline.trim() === '') {
      throw new Error('剧情大纲不能为空')
    }

    // 2. 获取 AI 配置
    const aiConfig = getCurrentAIConfig()
    
    // 3. 对于 Vertex AI，确保有 projectId（从配置或密钥文件读取）
    if (aiConfig.name === 'Google Vertex AI') {
      if (!aiConfig.projectId) {
        // 尝试从密钥文件读取
        try {
          aiConfig.projectId = getProjectIdFromCredentials(aiConfig.credentialsPath)
        } catch (error) {
          throw new Error(`无法获取项目 ID: ${error.message}`)
        }
      }
    }

    console.log(`🤖 使用 AI 服务: ${aiConfig.name}`)
    console.log(`📝 目标字数: ${targetWords} 字`)

    // 3. 生成完整提示词
    const fullPrompt = generateFullPrompt({
      outline,
      characters,
      items,
      scene,
      previousContent,
      targetWords
    })

    console.log('📄 提示词长度:', fullPrompt.length, '字符')
    console.log('\n' + '='.repeat(80))
    console.log('📝 生成的完整提示词内容')
    console.log('='.repeat(80))
    console.log(fullPrompt)
    console.log('='.repeat(80) + '\n')

    // 4. 调用 AI API
    let result
    if (aiConfig.name === 'Google Vertex AI') {
      result = await callVertexAI(fullPrompt, aiConfig)
    } else if (aiConfig.name === 'OpenAI') {
      result = await callOpenAI(fullPrompt, aiConfig)
    } else if (aiConfig.name === 'Claude') {
      result = await callClaude(fullPrompt, aiConfig)
    } else {
      throw new Error(`不支持的 AI 服务: ${aiConfig.name}`)
    }

    // 5. 返回结果
    console.log('\n' + '='.repeat(80))
    console.log('✨ AI 生成的小说内容')
    console.log('='.repeat(80))
    console.log(result.content)
    console.log('='.repeat(80) + '\n')
    console.log('✅ 内容生成成功')
    console.log('📊 生成字数:', result.content.length, '字符')
    console.log('💰 Token 消耗: 输入', result.usage.promptTokens, '+ 输出', result.usage.completionTokens, '= 总计', result.usage.totalTokens, '\n')

    return {
      success: true,
      content: result.content,
      usage: result.usage,
      model: aiConfig.model.name
    }

  } catch (error) {
    console.error('❌ 生成内容失败:', error.message)
    throw error
  }
}

/**
 * 调用 Google Vertex AI API
 * 使用服务账号认证
 * 
 * @param {string} prompt - 提示词
 * @param {Object} config - AI 配置
 * @returns {Promise<Object>} API 响应
 */
async function callVertexAI(prompt, config) {
  try {
    // 1. 获取访问令牌
    console.log('🔐 正在获取访问令牌...')
    const accessToken = await getGoogleAccessToken(config.credentialsPath)
    console.log('✅ 访问令牌获取成功')

    // 2. 获取项目 ID（优先使用配置中的，否则从密钥文件读取）
    const projectId = config.projectId || getProjectIdFromCredentials(config.credentialsPath)
    console.log('📋 项目 ID:', projectId)

    // 3. 构建 API 端点
    const endpoints = config.getEndpoint(projectId, config.location)
    const endpoint = endpoints.generateContent
    
    console.log('🌐 API 端点:', endpoint)

    // 4. 构建请求体
    const requestBody = buildVertexAIRequestBody(prompt)

    // 输出完整的 API 请求信息
    console.log('\n' + '='.repeat(80))
    console.log('📤 发送给 Google Vertex AI 的完整请求')
    console.log('='.repeat(80))
    console.log('🌐 请求方法: POST')
    console.log('🌐 请求 URL:', endpoint)
    console.log('\n📋 请求 Headers:')
    console.log(JSON.stringify({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer [ACCESS_TOKEN]' // 隐藏真实 token
    }, null, 2))
    console.log('\n📦 请求 Body:')
    console.log(JSON.stringify(requestBody, null, 2))
    console.log('='.repeat(80) + '\n')

    // 5. 配置请求选项（包括代理）
    const axiosConfig = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      timeout: config.timeout.response
    }

    // 如果环境变量中有代理配置，使用代理（中国网络环境必需）
    const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY
    if (proxyUrl) {
      console.log('🔄 使用代理:', proxyUrl.replace(/\/\/[^@]*@/, '//***:***@')) // 隐藏认证信息
      axiosConfig.httpsAgent = new HttpsProxyAgent(proxyUrl)
      axiosConfig.proxy = false // 禁用 axios 默认代理处理
    } else {
      console.log('ℹ️  未配置代理，直接连接（如果在中国可能会失败）')
    }

    // 6. 发送请求
    const response = await axios.post(endpoint, requestBody, axiosConfig)

    console.log('📥 收到响应')

    // 7. 解析响应
    if (!response.data || !response.data.candidates || response.data.candidates.length === 0) {
      console.error('❌ API 返回数据:', JSON.stringify(response.data, null, 2))
      throw new Error('API 返回数据格式错误或为空')
    }

    const candidate = response.data.candidates[0]
    const content = candidate.content?.parts?.[0]?.text || ''

    if (!content) {
      console.error('❌ 候选内容:', JSON.stringify(candidate, null, 2))
      throw new Error('API 未返回有效内容')
    }

    // 8. 提取 token 使用信息
    const usage = {
      promptTokens: response.data.usageMetadata?.promptTokenCount || 0,
      completionTokens: response.data.usageMetadata?.candidatesTokenCount || 0,
      totalTokens: response.data.usageMetadata?.totalTokenCount || 0
    }

    // 输出完整的 API 响应信息
    console.log('\n' + '='.repeat(80))
    console.log('📥 Google Vertex AI 返回的完整响应')
    console.log('='.repeat(80))
    console.log('📊 Token 使用统计:')
    console.log(`   ├─ 输入 Token (Input):  ${usage.promptTokens} tokens`)
    console.log(`   ├─ 输出 Token (Output): ${usage.completionTokens} tokens`)
    console.log(`   └─ 总计 Token (Total):  ${usage.totalTokens} tokens`)
    console.log('\n📝 生成内容长度:', content.trim().length, '字符')
    console.log('\n📄 完整响应数据:')
    console.log(JSON.stringify({
      candidates: response.data.candidates,
      usageMetadata: response.data.usageMetadata,
      modelVersion: response.data.modelVersion
    }, null, 2))
    console.log('='.repeat(80) + '\n')

    // 9. 返回标准化结果
    return {
      content: content.trim(),
      usage: usage
    }

  } catch (error) {
    console.error('❌ Vertex AI 调用失败:', error.response?.data || error.message)
    
    // 处理特定错误
    if (error.response) {
      const status = error.response.status
      const errorData = error.response.data?.error
      const message = errorData?.message || error.message

      console.error('错误详情:', JSON.stringify(error.response.data, null, 2))

      if (status === 401) {
        throw new Error('API 认证失败，请检查服务账号密钥是否正确')
      } else if (status === 403) {
        throw new Error(`API 权限不足: ${message}。请确保服务账号有 Vertex AI 权限`)
      } else if (status === 404) {
        throw new Error(`API 端点不存在: ${message}。请检查模型名称和区域配置`)
      } else if (status === 429) {
        throw new Error('API 请求频率超限，请稍后重试')
      } else if (status === 500) {
        throw new Error('AI 服务内部错误，请稍后重试')
      } else {
        throw new Error(`API 错误 (${status}): ${message}`)
      }
    }

    throw error
  }
}

/**
 * 调用 Vertex AI 流式 API（高级功能）
 * 用于实时返回生成内容，提升用户体验
 * 
 * @param {string} prompt - 提示词
 * @param {Object} config - AI 配置
 * @param {Function} onChunk - 接收到数据块时的回调函数
 * @returns {Promise<Object>} 完整响应
 */
async function callVertexAIStream(prompt, config, onChunk) {
  try {
    // 构建流式端点
    const endpoint = `https://aiplatform.googleapis.com/v1/projects/${config.projectId}/locations/${config.location}/${config.model.fullPath}:streamGenerateContent`
    
    console.log('🌊 使用流式 API:', endpoint)

    // 构建请求体
    const requestBody = buildVertexAIRequestBody(prompt)

    // 发送流式请求
    const response = await axios.post(endpoint, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      responseType: 'stream',
      timeout: config.timeout.response
    })

    let fullContent = ''
    let usage = {}

    // 处理流式数据
    return new Promise((resolve, reject) => {
      response.data.on('data', (chunk) => {
        try {
          // 解析数据块
          const lines = chunk.toString().split('\n').filter(line => line.trim())
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const jsonStr = line.slice(6) // 移除 "data: " 前缀
              const data = JSON.parse(jsonStr)
              
              if (data.candidates && data.candidates[0]) {
                const text = data.candidates[0].content?.parts?.[0]?.text || ''
                if (text) {
                  fullContent += text
                  // 回调函数，实时返回数据块
                  if (onChunk) {
                    onChunk(text)
                  }
                }
              }

              // 记录 token 使用情况
              if (data.usageMetadata) {
                usage = {
                  promptTokens: data.usageMetadata.promptTokenCount || 0,
                  completionTokens: data.usageMetadata.candidatesTokenCount || 0,
                  totalTokens: data.usageMetadata.totalTokenCount || 0
                }
              }
            }
          }
        } catch (err) {
          console.error('解析流式数据失败:', err)
        }
      })

      response.data.on('end', () => {
        resolve({
          content: fullContent.trim(),
          usage
        })
      })

      response.data.on('error', (err) => {
        reject(new Error(`流式传输错误: ${err.message}`))
      })
    })

  } catch (error) {
    console.error('Vertex AI 流式调用失败:', error.message)
    throw error
  }
}

/**
 * 调用 OpenAI API（预留）
 * 
 * @param {string} prompt - 提示词
 * @param {Object} config - AI 配置
 * @returns {Promise<Object>} API 响应
 */
async function callOpenAI(prompt, config) {
  try {
    const response = await axios.post(
      config.endpoint.chatCompletion,
      {
        model: config.model.name,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: config.parameters.temperature,
        max_tokens: config.parameters.maxTokens,
        top_p: config.parameters.topP
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        }
      }
    )

    const content = response.data.choices[0].message.content

    return {
      content: content.trim(),
      usage: {
        promptTokens: response.data.usage.prompt_tokens,
        completionTokens: response.data.usage.completion_tokens,
        totalTokens: response.data.usage.total_tokens
      }
    }
  } catch (error) {
    console.error('OpenAI 调用失败:', error.message)
    throw error
  }
}

/**
 * 调用 Claude API（预留）
 * 
 * @param {string} prompt - 提示词
 * @param {Object} config - AI 配置
 * @returns {Promise<Object>} API 响应
 */
async function callClaude(prompt, config) {
  try {
    const response = await axios.post(
      config.endpoint.messages,
      {
        model: config.model.name,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: config.parameters.maxTokens,
        temperature: config.parameters.temperature
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.apiKey,
          'anthropic-version': '2023-06-01'
        }
      }
    )

    const content = response.data.content[0].text

    return {
      content: content.trim(),
      usage: {
        promptTokens: response.data.usage.input_tokens,
        completionTokens: response.data.usage.output_tokens,
        totalTokens: response.data.usage.input_tokens + response.data.usage.output_tokens
      }
    }
  } catch (error) {
    console.error('Claude 调用失败:', error.message)
    throw error
  }
}

/**
 * 带重试机制的 API 调用
 * 用于提高调用成功率
 * 
 * @param {Function} apiCall - API 调用函数
 * @param {number} maxRetries - 最大重试次数
 * @param {number} delay - 重试延迟（毫秒）
 * @returns {Promise<Object>} API 响应
 */
async function callWithRetry(apiCall, maxRetries = 3, delay = 1000) {
  let lastError

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall()
    } catch (error) {
      lastError = error
      console.log(`⚠️ 第 ${i + 1} 次尝试失败，${delay}ms 后重试...`)
      
      // 如果是认证错误或参数错误，不重试
      if (error.message.includes('认证') || error.message.includes('参数')) {
        throw error
      }

      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, delay))
      delay *= 2 // 指数退避
    }
  }

  throw lastError
}

/**
 * 测试 AI 连接
 * 用于验证配置是否正确
 * 
 * @returns {Promise<Object>} 测试结果
 */
async function testConnection() {
  try {
    const config = getCurrentAIConfig()
    
    console.log('📋 验证配置...')
    
    // 验证配置（允许 projectId 为空，因为可以从密钥文件读取）
    if (!config.credentialsPath) {
      return {
        success: false,
        message: '缺少 Google Cloud 密钥文件路径'
      }
    }

    // 检查密钥文件是否存在
    if (!fs.existsSync(config.credentialsPath)) {
      return {
        success: false,
        message: `密钥文件不存在: ${config.credentialsPath}`
      }
    }

    console.log('✅ 密钥文件存在:', config.credentialsPath)

    // 尝试读取项目 ID
    try {
      const projectId = config.projectId || getProjectIdFromCredentials(config.credentialsPath)
      console.log('✅ 项目 ID:', projectId)
    } catch (error) {
      return {
        success: false,
        message: `无法读取项目 ID: ${error.message}`
      }
    }

    // 发送简单的测试请求
    console.log('🧪 发送测试请求...')
    const testPrompt = '请用中文回复"测试成功"四个字。'
    const result = await callVertexAI(testPrompt, config)

    return {
      success: true,
      message: '连接成功',
      model: config.model.name,
      response: result.content,
      usage: result.usage
    }
  } catch (error) {
    return {
      success: false,
      message: `连接失败: ${error.message}`
    }
  }
}

/**
 * 导出函数
 */
export {
  generateNovelContent,
  callVertexAI,
  callVertexAIStream,
  callWithRetry,
  testConnection
}

export default {
  generateNovelContent,
  callVertexAI,
  callVertexAIStream,
  callWithRetry,
  testConnection
}

