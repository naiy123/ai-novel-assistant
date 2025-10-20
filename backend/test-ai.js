/**
 * AI API 测试脚本
 * 
 * 用途：
 * 1. 测试 Vertex AI 配置是否正确
 * 2. 测试 API 调用是否成功
 * 3. 查看完整的请求和响应
 * 
 * 使用方法：
 * node test-ai.js
 */

import { generateNovelContent, testConnection } from './services/ai-service.js'
import dotenv from 'dotenv'

// 加载环境变量
dotenv.config()

console.log('🧪 AI API 测试脚本')
console.log('=' .repeat(50))
console.log()

// 测试配置
async function testConfig() {
  console.log('1️⃣ 检查配置...')
  console.log('- VERTEX_AI_API_KEY:', process.env.VERTEX_AI_API_KEY ? '✅ 已配置' : '❌ 未配置')
  console.log('- VERTEX_AI_PROJECT_ID:', process.env.VERTEX_AI_PROJECT_ID ? '✅ 已配置' : '❌ 未配置')
  console.log('- VERTEX_AI_LOCATION:', process.env.VERTEX_AI_LOCATION || 'us-central1 (默认)')
  console.log()

  if (!process.env.VERTEX_AI_API_KEY || !process.env.VERTEX_AI_PROJECT_ID) {
    console.log('⚠️ 请在 backend/.env 文件中配置以下环境变量：')
    console.log('   VERTEX_AI_API_KEY=你的API密钥')
    console.log('   VERTEX_AI_PROJECT_ID=你的项目ID')
    console.log()
    console.log('获取方式：')
    console.log('1. 访问 https://console.cloud.google.com/')
    console.log('2. 创建或选择一个项目')
    console.log('3. 启用 Vertex AI API')
    console.log('4. 创建服务账号并生成密钥')
    console.log()
    return false
  }

  return true
}

// 测试连接
async function runConnectionTest() {
  console.log('2️⃣ 测试 AI 连接...')
  
  try {
    const result = await testConnection()
    
    if (result.success) {
      console.log('✅ 连接成功！')
      console.log('- 服务:', result.model)
      console.log('- 响应:', result.response)
      console.log()
      return true
    } else {
      console.log('❌ 连接失败:', result.message)
      console.log()
      return false
    }
  } catch (error) {
    console.log('❌ 连接测试异常:', error.message)
    console.log()
    return false
  }
}

// 测试内容生成
async function runGenerationTest() {
  console.log('3️⃣ 测试内容生成...')
  console.log()

  // 测试数据
  const testData = {
    outline: '主角在古老的图书馆中发现了一本神秘的魔法书，当他翻开第一页时，书中突然散发出耀眼的光芒。',
    characters: [
      {
        id: 1,
        name: '林枫',
        age: 18,
        gender: '男',
        personality: '好奇心强，勇敢果断',
        appearance: '黑色短发，眼神坚定',
        background: '普通高中生，偶然获得了进入魔法世界的机会'
      }
    ],
    items: [
      {
        id: 1,
        name: '魔法之书',
        rarity: '传说',
        description: '封面镶嵌着蓝色宝石的古老书籍',
        function: '记录着失传已久的魔法咒语'
      }
    ],
    scene: {
      id: 1,
      name: '古老图书馆',
      time_period: '现代',
      atmosphere: '神秘、幽静',
      description: '藏书丰富的老旧图书馆，充满历史的气息'
    },
    targetWords: 500 // 测试用较少字数
  }

  console.log('测试数据：')
  console.log('- 剧情大纲:', testData.outline)
  console.log('- 人物:', testData.characters.map(c => c.name).join(', '))
  console.log('- 物品:', testData.items.map(i => i.name).join(', '))
  console.log('- 场景:', testData.scene.name)
  console.log('- 目标字数:', testData.targetWords)
  console.log()
  console.log('⏳ 正在生成内容（这可能需要几秒钟）...')
  console.log()

  try {
    const startTime = Date.now()
    
    const result = await generateNovelContent(testData)
    
    const endTime = Date.now()
    const duration = ((endTime - startTime) / 1000).toFixed(2)

    console.log('✅ 生成成功！')
    console.log()
    console.log('生成内容:')
    console.log('-'.repeat(50))
    console.log(result.content)
    console.log('-'.repeat(50))
    console.log()
    console.log('统计信息:')
    console.log('- 生成字数:', result.content.length, '字符')
    console.log('- 使用模型:', result.model)
    console.log('- 耗时:', duration, '秒')
    if (result.usage) {
      console.log('- Token 使用:')
      console.log('  · 提示词:', result.usage.promptTokens)
      console.log('  · 生成:', result.usage.completionTokens)
      console.log('  · 总计:', result.usage.totalTokens)
    }
    console.log()

    return true

  } catch (error) {
    console.log('❌ 生成失败:', error.message)
    console.log()
    console.log('错误详情:')
    console.log(error)
    console.log()
    return false
  }
}

// 主函数
async function main() {
  try {
    // 1. 检查配置
    const configOk = await testConfig()
    if (!configOk) {
      console.log('❌ 配置检查失败，无法继续测试')
      process.exit(1)
    }

    // 2. 测试连接
    const connectionOk = await runConnectionTest()
    if (!connectionOk) {
      console.log('❌ 连接测试失败，请检查配置和网络')
      process.exit(1)
    }

    // 3. 测试生成
    const generationOk = await runGenerationTest()
    
    if (generationOk) {
      console.log('🎉 所有测试通过！')
      console.log()
      console.log('你现在可以在前端使用 AI 写作功能了。')
      process.exit(0)
    } else {
      console.log('❌ 生成测试失败')
      process.exit(1)
    }

  } catch (error) {
    console.error('❌ 测试过程中出现异常:', error)
    process.exit(1)
  }
}

// 运行测试
main()


