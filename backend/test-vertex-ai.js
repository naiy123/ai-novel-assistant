/**
 * Vertex AI 连接测试脚本
 * 
 * 用途：
 * 1. 测试 Google Cloud 服务账号认证
 * 2. 测试能否成功调用 Vertex AI API
 * 3. 查看完整的请求和响应过程
 * 
 * 使用方法：
 * node test-vertex-ai.js
 */

import { GoogleAuth } from 'google-auth-library'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import { testConnection, generateNovelContent } from './services/ai-service.js'

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 加载环境变量
dotenv.config()

console.log('🧪 Vertex AI 连接测试脚本')
console.log('='.repeat(60))
console.log()

/**
 * 步骤 1：检查配置文件
 */
async function step1CheckConfig() {
  console.log('📋 步骤 1: 检查配置文件')
  console.log('-'.repeat(60))
  
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || 
                         path.join(__dirname, 'credentials', 'google-cloud-key.json')
  
  console.log('📁 密钥文件路径:', credentialsPath)
  
  // 检查文件是否存在
  if (!fs.existsSync(credentialsPath)) {
    console.log('❌ 密钥文件不存在！')
    console.log()
    console.log('请确保：')
    console.log('1. 已下载 Google Cloud 服务账号的 JSON 密钥文件')
    console.log('2. 将文件放在 backend/credentials/google-cloud-key.json')
    console.log('   或设置环境变量 GOOGLE_APPLICATION_CREDENTIALS')
    console.log()
    return false
  }
  
  console.log('✅ 密钥文件存在')
  
  // 读取并显示密钥文件信息（隐藏敏感信息）
  try {
    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'))
    console.log()
    console.log('密钥文件信息：')
    console.log('- 类型:', credentials.type)
    console.log('- 项目 ID:', credentials.project_id)
    console.log('- 客户端邮箱:', credentials.client_email)
    console.log('- 私钥 ID:', credentials.private_key_id?.substring(0, 8) + '...')
    console.log()
    
    return true
  } catch (error) {
    console.log('❌ 读取密钥文件失败:', error.message)
    console.log()
    return false
  }
}

/**
 * 步骤 2：测试获取访问令牌
 */
async function step2TestAuth() {
  console.log('📋 步骤 2: 测试获取访问令牌')
  console.log('-'.repeat(60))
  
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || 
                         path.join(__dirname, 'credentials', 'google-cloud-key.json')
  
  try {
    console.log('🔐 正在获取访问令牌...')
    
    const auth = new GoogleAuth({
      keyFile: credentialsPath,
      scopes: ['https://www.googleapis.com/auth/cloud-platform']
    })
    
    const client = await auth.getClient()
    const token = await client.getAccessToken()
    
    if (!token.token) {
      console.log('❌ 无法获取访问令牌')
      return false
    }
    
    console.log('✅ 访问令牌获取成功')
    console.log('- 令牌前缀:', token.token.substring(0, 20) + '...')
    console.log('- 令牌长度:', token.token.length, '字符')
    console.log()
    
    return true
  } catch (error) {
    console.log('❌ 获取访问令牌失败:', error.message)
    console.log()
    console.log('可能的原因：')
    console.log('1. 密钥文件格式不正确')
    console.log('2. 服务账号权限不足')
    console.log('3. 网络连接问题')
    console.log()
    return false
  }
}

/**
 * 步骤 3：测试 AI 服务连接
 */
async function step3TestConnection() {
  console.log('📋 步骤 3: 测试 AI 服务连接')
  console.log('-'.repeat(60))
  
  try {
    console.log('🧪 调用 testConnection()...')
    console.log()
    
    const result = await testConnection()
    
    if (result.success) {
      console.log('✅ 连接测试成功！')
      console.log()
      console.log('响应信息：')
      console.log('- 模型:', result.model)
      console.log('- AI 回复:', result.response)
      if (result.usage) {
        console.log('- Token 使用:')
        console.log('  · 输入:', result.usage.promptTokens)
        console.log('  · 输出:', result.usage.completionTokens)
        console.log('  · 总计:', result.usage.totalTokens)
      }
      console.log()
      return true
    } else {
      console.log('❌ 连接测试失败:', result.message)
      console.log()
      return false
    }
  } catch (error) {
    console.log('❌ 连接测试异常:', error.message)
    console.log()
    console.log('错误详情:')
    console.log(error)
    console.log()
    return false
  }
}

/**
 * 步骤 4：测试内容生成
 */
async function step4TestGeneration() {
  console.log('📋 步骤 4: 测试内容生成')
  console.log('-'.repeat(60))
  
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
    targetWords: 500
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
    console.log('='.repeat(60))
    console.log(result.content)
    console.log('='.repeat(60))
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
      
      // 估算费用（gemini-2.0-flash-exp 是免费的）
      console.log('  · 费用: 免费（实验模型）')
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

/**
 * 主函数
 */
async function main() {
  try {
    console.log('开始测试...')
    console.log()
    
    // 步骤 1: 检查配置文件
    const step1Ok = await step1CheckConfig()
    if (!step1Ok) {
      console.log('❌ 步骤 1 失败，无法继续')
      process.exit(1)
    }
    
    // 步骤 2: 测试获取访问令牌
    const step2Ok = await step2TestAuth()
    if (!step2Ok) {
      console.log('❌ 步骤 2 失败，无法继续')
      console.log()
      console.log('请检查：')
      console.log('1. 密钥文件是否正确')
      console.log('2. 服务账号是否有效')
      console.log('3. 网络连接是否正常')
      process.exit(1)
    }
    
    // 步骤 3: 测试 AI 服务连接
    const step3Ok = await step3TestConnection()
    if (!step3Ok) {
      console.log('❌ 步骤 3 失败，无法继续')
      console.log()
      console.log('请检查：')
      console.log('1. 服务账号是否启用了 Vertex AI API')
      console.log('2. 服务账号是否有 Vertex AI User 角色')
      console.log('3. 项目是否启用了计费')
      console.log('4. 区域配置是否正确')
      process.exit(1)
    }
    
    // 步骤 4: 测试内容生成
    const step4Ok = await step4TestGeneration()
    
    if (step4Ok) {
      console.log('🎉 所有测试通过！')
      console.log()
      console.log('✅ 你的 Vertex AI 配置完全正确')
      console.log('✅ 现在可以在应用中使用 AI 写作功能了')
      console.log()
      console.log('下一步：')
      console.log('1. 启动应用: npm run dev')
      console.log('2. 访问 http://localhost:3000')
      console.log('3. 开始使用 AI 写作功能')
      console.log()
      process.exit(0)
    } else {
      console.log('❌ 步骤 4 失败')
      console.log()
      console.log('虽然连接成功，但内容生成失败')
      console.log('请检查错误信息并重试')
      process.exit(1)
    }
    
  } catch (error) {
    console.error('❌ 测试过程中出现异常:', error)
    console.error()
    console.error('完整错误信息:')
    console.error(error)
    process.exit(1)
  }
}

// 运行测试
main()


