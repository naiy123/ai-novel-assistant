/**
 * AI 反检测生成服务
 * 
 * 实现多轮API调用策略：
 * 1. 第一轮：生成初稿（场景驱动）
 * 2. 第二轮：风格改写（AI腔→网文腔）
 * 3. 统计总token消耗
 */

import { getCurrentAIConfig, buildVertexAIRequestBody } from '../config/api-config.js'
import { getGoogleAccessToken, getProjectIdFromCredentials, callVertexAI } from './ai-service.js'
import axios from 'axios'
import { HttpsProxyAgent } from 'https-proxy-agent'
import fs from 'fs'

/**
 * 反检测模式生成小说内容
 * 采用多轮生成策略
 */
export async function generateStealthContent({
  outline,
  characters = [],
  items = [],
  scene = null,
  previousContent = '',
  targetWords = 2000
}) {
  try {
    console.log('\n' + '🛡️ '.repeat(40))
    console.log('🛡️  启动反检测生成模式')
    console.log('🛡️ '.repeat(40))
    console.log('')
    
    // 统计token消耗
    const tokenStats = {
      round1: { input: 0, output: 0, total: 0 },
      round2: { input: 0, output: 0, total: 0 },
      total: { input: 0, output: 0, total: 0 }
    }
    
    // ===== 第一轮：生成初稿（场景驱动） =====
    console.log('📝 第一轮生成：场景驱动式初稿')
    console.log('━'.repeat(80))
    
    const firstRoundPrompt = buildFirstRoundPrompt({
      outline,
      characters,
      items,
      scene,
      previousContent,
      targetWords
    })
    
    console.log('📄 第一轮提示词长度:', firstRoundPrompt.length, '字符')
    
    const firstResult = await callAIWithLogging(firstRoundPrompt, {
      temperature: 0.9,  // 高随机性
      maxOutputTokens: Math.ceil(targetWords * 2.5)
    })
    
    tokenStats.round1 = firstResult.usage
    console.log('✅ 第一轮生成完成')
    console.log('📊 Token消耗:', `输入 ${firstResult.usage.promptTokens} + 输出 ${firstResult.usage.completionTokens} = 总计 ${firstResult.usage.totalTokens}`)
    console.log('📝 生成字数:', firstResult.content.length, '字符')
    console.log('')
    
    // ===== 第二轮：风格改写（AI腔→网文腔） =====
    console.log('🎨 第二轮生成：风格迁移改写（核心）')
    console.log('━'.repeat(80))
    
    const secondRoundPrompt = buildSecondRoundPrompt(firstResult.content)
    
    console.log('📄 第二轮提示词长度:', secondRoundPrompt.length, '字符')
    
    const secondResult = await callAIWithLogging(secondRoundPrompt, {
      temperature: 0.7,  // 较低温度保持稳定
      maxOutputTokens: Math.ceil(targetWords * 2.5)
    })
    
    tokenStats.round2 = secondResult.usage
    console.log('✅ 第二轮改写完成')
    console.log('📊 Token消耗:', `输入 ${secondResult.usage.promptTokens} + 输出 ${secondResult.usage.completionTokens} = 总计 ${secondResult.usage.totalTokens}`)
    console.log('📝 最终字数:', secondResult.content.length, '字符')
    console.log('')
    
    // ===== 统计总消耗 =====
    tokenStats.total.input = tokenStats.round1.promptTokens + tokenStats.round2.promptTokens
    tokenStats.total.output = tokenStats.round1.completionTokens + tokenStats.round2.completionTokens
    tokenStats.total.total = tokenStats.round1.totalTokens + tokenStats.round2.totalTokens
    
    console.log('🛡️ '.repeat(40))
    console.log('💰 反检测模式 - 总消耗统计')
    console.log('🛡️ '.repeat(40))
    console.log(`📊 第一轮: ${tokenStats.round1.totalTokens} tokens`)
    console.log(`📊 第二轮: ${tokenStats.round2.totalTokens} tokens`)
    console.log(`💰 总计: ${tokenStats.total.total} tokens`)
    console.log(`   ├─ 输入: ${tokenStats.total.input} tokens`)
    console.log(`   └─ 输出: ${tokenStats.total.output} tokens`)
    console.log('🛡️ '.repeat(40))
    console.log('')
    
    return {
      success: true,
      content: secondResult.content,
      usage: tokenStats.total,
      stealthMode: true,
      rounds: {
        round1: {
          content: firstResult.content,
          usage: tokenStats.round1
        },
        round2: {
          content: secondResult.content,
          usage: tokenStats.round2
        }
      }
    }
    
  } catch (error) {
    console.error('❌ 反检测生成失败:', error.message)
    throw error
  }
}

/**
 * 构建第一轮prompt：场景驱动生成
 */
function buildFirstRoundPrompt({ outline, characters, items, scene, previousContent, targetWords }) {
  let prompt = '# 网文创作任务\n\n'
  prompt += '你是一位经验丰富的网文作者，擅长快节奏、高信息密度的网络小说创作。\n\n'
  
  // 剧情大纲
  prompt += '## 剧情大纲\n'
  prompt += `${outline}\n\n`
  
  // 人物信息
  if (characters.length > 0) {
    prompt += '## 相关人物\n'
    characters.forEach(char => {
      prompt += `### ${char.name}\n`
      if (char.personality) prompt += `- 性格：${char.personality}\n`
      if (char.appearance) prompt += `- 外貌：${char.appearance}\n`
      if (char.background) prompt += `- 背景：${char.background}\n`
      prompt += '\n'
    })
  }
  
  // 场景信息
  if (scene) {
    prompt += '## 场景背景\n'
    prompt += `### ${scene.name}\n`
    if (scene.atmosphere) prompt += `- 氛围：${scene.atmosphere}\n`
    if (scene.description) prompt += `- 描述：${scene.description}\n`
    prompt += '\n'
  }
  
  // 上文（如果是续写）
  if (previousContent) {
    prompt += '## 前文内容\n'
    // 只取最后500字作为上下文
    const contextLength = Math.min(previousContent.length, 500)
    const context = previousContent.slice(-contextLength)
    prompt += `${context}\n\n`
  }
  
  // 写作要求
  prompt += '## 写作要求\n'
  prompt += '1. **节奏控制**：快节奏叙事，一句话一个动作/情绪\n'
  prompt += '2. **场景驱动**：通过动作、对话、情绪推动情节\n'
  prompt += '3. **信息密度**：每段都有新信息，避免重复描写\n'
  prompt += '4. **视角明确**：保持第三人称限知视角\n'
  prompt += `5. **字数目标**：生成约 ${targetWords} 字的内容\n\n`
  
  // 网文范例参考
  prompt += '## 参考节奏（网文风格）\n'
  prompt += '```\n'
  prompt += '他握紧拳头。\n'
  prompt += '"你再说一遍？"\n'
  prompt += '空气瞬间凝固。\n'
  prompt += '```\n\n'
  
  prompt += '## 开始创作\n'
  prompt += '请根据以上信息，续写小说内容：\n'
  
  return prompt
}

/**
 * 构建第二轮prompt：风格改写
 */
function buildSecondRoundPrompt(aiGeneratedText) {
  let prompt = '# 网文风格改写任务\n\n'
  prompt += '你是网文改写专家，擅长将AI生成的"书面腔"改写为地道的"网文腔"。\n\n'
  
  prompt += '## 改写原则\n'
  prompt += '1. **保持情节100%不变** - 所有事件、对话、人物行为完全保留\n'
  prompt += '2. **句子拆分** - 将长句拆成短句，保持逻辑连贯\n'
  prompt += '3. **删减修饰** - 删除冗余的形容词和副词\n'
  prompt += '4. **增加动作** - 用动作和神态代替心理描写\n'
  prompt += '5. **口语化** - 对话更自然，适当加入语气词\n\n'
  
  prompt += '## 改写示例对比\n'
  prompt += '**AI腔（书面语）**：\n'
  prompt += '他感到非常愤怒，这种情绪几乎难以抑制，仿佛胸口有一团火焰在燃烧。\n\n'
  prompt += '**网文腔（目标风格）**：\n'
  prompt += '他握紧拳头。\n妈的。\n胸口像压了块石头。\n\n'
  
  prompt += '---\n\n'
  prompt += '**AI腔（书面语）**：\n'
  prompt += '她犹豫了片刻，最终还是决定说出心中的真相，尽管她知道这可能会带来不好的后果。\n\n'
  prompt += '**网文腔（目标风格）**：\n'
  prompt += '她咬了咬嘴唇。\n"其实……"\n算了，说吧。\n反正早晚要说的。\n\n'
  
  prompt += '---\n\n'
  
  prompt += '## 原文（需要改写）\n'
  prompt += '```\n'
  prompt += aiGeneratedText
  prompt += '\n```\n\n'
  
  prompt += '## 改写要求\n'
  prompt += '请将以上原文改写为网文风格，注意：\n'
  prompt += '- 保持所有情节和对话内容不变\n'
  prompt += '- 改变表达方式和句式\n'
  prompt += '- 符合网文快节奏、高密度的特点\n'
  prompt += '- 不要添加任何说明文字，直接输出改写后的内容\n\n'
  
  prompt += '改写后的内容：\n'
  
  return prompt
}

/**
 * 调用AI并记录详细日志
 */
async function callAIWithLogging(prompt, params = {}) {
  try {
    const aiConfig = getCurrentAIConfig()
    
    // 确保有projectId
    if (aiConfig.name === 'Google Vertex AI') {
      if (!aiConfig.projectId) {
        aiConfig.projectId = getProjectIdFromCredentials(aiConfig.credentialsPath)
      }
    }
    
    // 获取访问令牌
    const accessToken = await getGoogleAccessToken(aiConfig.credentialsPath)
    const projectId = aiConfig.projectId || getProjectIdFromCredentials(aiConfig.credentialsPath)
    
    // 构建API端点
    const endpoints = aiConfig.getEndpoint(projectId, aiConfig.location)
    const endpoint = endpoints.generateContent
    
    // 构建请求体（使用标准构建函数）
    const requestBody = buildVertexAIRequestBody(prompt, {
      temperature: params.temperature || 0.9,
      maxOutputTokens: params.maxOutputTokens || 2048,
      topP: params.topP || 0.92,
      topK: params.topK || 40
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
      console.log('🔄 使用代理:', proxyUrl.replace(/\/\/[^@]*@/, '//***:***@'))
      axiosConfig.httpsAgent = new HttpsProxyAgent(proxyUrl)
      axiosConfig.proxy = false
    }
    
    // 发送请求
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
    
    return {
      content: content.trim(),
      usage: usage
    }
    
  } catch (error) {
    console.error('❌ API调用失败:', error.message)
    throw error
  }
}

// 导出函数
export default {
  generateStealthContent
}

