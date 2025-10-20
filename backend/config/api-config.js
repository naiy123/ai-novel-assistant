/**
 * AI API 配置文件
 * 
 * 作用：
 * 1. 管理不同 AI 服务的配置
 * 2. 可以轻松切换不同的 AI 提供商
 * 3. 集中管理 API 密钥和参数
 * 
 * 支持的服务：
 * - Google Vertex AI (当前使用)
 * - OpenAI (预留)
 * - Claude (预留)
 */

import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

/**
 * Google Vertex AI 配置
 * 文档：https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/inference
 */
const VERTEX_AI_CONFIG = {
  // 服务名称
  name: 'Google Vertex AI',
  
  // 是否启用（可以通过这个开关快速切换服务）
  enabled: true,

  // API 认证信息
  // 方式 1：使用 JSON 密钥文件（推荐）
  credentialsPath: process.env.GOOGLE_APPLICATION_CREDENTIALS || 
                   path.join(__dirname, '..', 'credentials', 'google-cloud-key.json'),
  
  // 方式 2：直接使用环境变量（备选）
  projectId: process.env.VERTEX_AI_PROJECT_ID || '',
  location: process.env.VERTEX_AI_LOCATION || 'us-central1', // 默认区域

  // 模型配置
  model: {
    // 模型名称
    name: 'gemini-2.0-flash-exp',
    
    // 完整的模型路径（用于构建 API 端点）
    fullPath: 'publishers/google/models/gemini-2.0-flash-exp'
  },

  // API 端点构建函数
  getEndpoint: function(projectId, location) {
    const baseUrl = 'https://aiplatform.googleapis.com/v1'
    const projectPath = `projects/${projectId}/locations/${location}`
    return {
      // 流式生成端点（推荐使用，实时返回内容）
      streamGenerateContent: `${baseUrl}/${projectPath}/${this.model.fullPath}:streamGenerateContent`,
      
      // 普通生成端点（一次性返回完整内容）
      generateContent: `${baseUrl}/${projectPath}/${this.model.fullPath}:generateContent`
    }
  },

  // 请求参数配置
  parameters: {
    // 温度（0-1）：控制输出的随机性
    // - 0.0 = 非常确定性，输出固定
    // - 1.0 = 非常随机，输出多样
    // 建议：小说创作使用 0.7-0.9
    temperature: 1.15,

    // Top-p（0-1）：核采样参数
    // 控制从多少个词中选择下一个词
    // 建议：0.9-0.95 获得较好的多样性和连贯性
    topP: 0.98,

    // Top-k：每次采样考虑的词数量
    // 建议：40-50 之间
    topK: 60,

    // 最大输出 token 数
    // 注意：1 个 token 约等于 0.75 个英文单词，或 0.5 个中文字
    // 2000 字中文大约需要 4000 tokens
    maxOutputTokens: 4096,

    // 停止序列（可选）
    // 遇到这些文本时停止生成
    stopSequences: [],

    // 候选数量（通常设为 1）
    candidateCount: 1,

    // 安全设置（控制内容过滤）
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE'
      }
    ]
  },

  // 请求头配置
  headers: {
    'Content-Type': 'application/json'
  },

  // 重试配置
  retry: {
    // 最大重试次数
    maxRetries: 3,
    
    // 重试延迟（毫秒）
    retryDelay: 1000,
    
    // 延迟倍增因子（每次重试延迟翻倍）
    backoffFactor: 2
  },

  // 超时设置（毫秒）
  timeout: {
    // 连接超时
    connect: 10000,
    
    // 响应超时（流式请求可能需要更长时间）
    response: 60000
  }
}

/**
 * OpenAI 配置（预留）
 * 如果以后想切换到 OpenAI，可以配置这里
 */
const OPENAI_CONFIG = {
  name: 'OpenAI',
  enabled: false,
  apiKey: process.env.OPENAI_API_KEY || '',
  
  model: {
    name: 'gpt-4',
    // 或者使用 'gpt-3.5-turbo'
  },

  endpoint: {
    baseUrl: 'https://api.openai.com/v1',
    chatCompletion: 'https://api.openai.com/v1/chat/completions'
  },

  parameters: {
    temperature: 0.8,
    maxTokens: 4096,
    topP: 0.95,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0
  }
}

/**
 * Claude 配置（预留）
 * Anthropic Claude API
 */
const CLAUDE_CONFIG = {
  name: 'Claude',
  enabled: false,
  apiKey: process.env.CLAUDE_API_KEY || '',
  
  model: {
    name: 'claude-3-opus-20240229',
    // 或者使用 'claude-3-sonnet-20240229'
  },

  endpoint: {
    baseUrl: 'https://api.anthropic.com/v1',
    messages: 'https://api.anthropic.com/v1/messages'
  },

  parameters: {
    temperature: 0.8,
    maxTokens: 4096
  }
}

/**
 * 获取当前启用的 AI 配置
 * 
 * @returns {Object} 当前启用的 AI 配置对象
 */
function getCurrentAIConfig() {
  // 按优先级检查
  // Vertex AI: 检查 credentialsPath（新的认证方式）
  if (VERTEX_AI_CONFIG.enabled && VERTEX_AI_CONFIG.credentialsPath) {
    return VERTEX_AI_CONFIG
  }
  
  // OpenAI: 检查 apiKey
  if (OPENAI_CONFIG.enabled && OPENAI_CONFIG.apiKey) {
    return OPENAI_CONFIG
  }
  
  // Claude: 检查 apiKey
  if (CLAUDE_CONFIG.enabled && CLAUDE_CONFIG.apiKey) {
    return CLAUDE_CONFIG
  }

  throw new Error('没有配置可用的 AI 服务！请检查环境变量和配置文件。\n提示：Vertex AI 需要配置 GOOGLE_APPLICATION_CREDENTIALS')
}

/**
 * 验证配置是否完整
 * 
 * @param {Object} config - AI 配置对象
 * @returns {Object} 验证结果 { valid: boolean, errors: Array }
 */
function validateConfig(config) {
  const errors = []

  // 检查认证配置
  if (config.name === 'Google Vertex AI') {
    // 检查是否有 JSON 密钥文件路径
    if (!config.credentialsPath) {
      errors.push('缺少 Google Cloud 密钥文件路径')
    }
    
    // 检查项目 ID（可能从 JSON 文件读取，或从环境变量）
    if (!config.projectId) {
      errors.push('缺少 Project ID（将从密钥文件读取）')
    }
  } else if (config.name === 'OpenAI') {
    if (!config.apiKey) {
      errors.push('缺少 OpenAI API Key')
    }
  } else if (config.name === 'Claude') {
    if (!config.apiKey) {
      errors.push('缺少 Claude API Key')
    }
  }

  if (!config.model || !config.model.name) {
    errors.push('未配置模型名称')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 构建 Vertex AI 请求体
 * 
 * @param {string} prompt - 提示词
 * @param {Object} options - 可选参数（覆盖默认配置）
 * @returns {Object} 请求体对象
 */
function buildVertexAIRequestBody(prompt, options = {}) {
  const config = VERTEX_AI_CONFIG

  return {
    contents: [{
      role: 'user',
      parts: [{
        text: prompt
      }]
    }],
    generationConfig: {
      temperature: options.temperature || config.parameters.temperature,
      topP: options.topP || config.parameters.topP,
      topK: options.topK || config.parameters.topK,
      maxOutputTokens: options.maxOutputTokens || config.parameters.maxOutputTokens,
      candidateCount: config.parameters.candidateCount,
      stopSequences: options.stopSequences || config.parameters.stopSequences
    },
    safetySettings: config.parameters.safetySettings
  }
}

/**
 * 导出配置
 */
export {
  VERTEX_AI_CONFIG,
  OPENAI_CONFIG,
  CLAUDE_CONFIG,
  getCurrentAIConfig,
  validateConfig,
  buildVertexAIRequestBody
}

export default {
  VERTEX_AI_CONFIG,
  OPENAI_CONFIG,
  CLAUDE_CONFIG,
  getCurrentAIConfig,
  validateConfig,
  buildVertexAIRequestBody
}

