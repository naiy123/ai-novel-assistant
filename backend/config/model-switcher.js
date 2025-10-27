/**
 * Gemini 模型快速切换工具
 * 
 * 使用方法：
 * 1. 修改 CURRENT_MODEL 变量为你想要的模型
 * 2. 保存文件，nodemon会自动重启
 * 3. 所有AI功能将使用新模型
 */

/**
 * ⚙️ 在这里选择你要使用的模型
 * 直接修改下面这一行，保存即可切换！
 */
export const CURRENT_MODEL = 'gemini-2.0-flash'  // ← 在这里修改模型名称

/**
 * 📋 可用的 Gemini 模型列表
 */
export const AVAILABLE_MODELS = {
  // Gemini 2.5 系列（最新，推荐）
  'gemini-2.5-flash': {
    name: 'gemini-2.5-flash',
    fullPath: 'publishers/google/models/gemini-2.5-flash',
    description: 'Gemini 2.5 Flash - 平衡性能和速度',
    pricing: '标准',
    features: ['快速响应', '高质量', '多模态支持'],
    maxTokens: 8192,
    recommended: true
  },
  
  'gemini-2.5-flash-lite': {
    name: 'gemini-2.5-flash-lite',
    fullPath: 'publishers/google/models/gemini-2.5-flash-lite',
    description: 'Gemini 2.5 Flash Lite - 轻量快速版本',
    pricing: '低成本',
    features: ['超快响应', '低成本', '适合高频调用'],
    maxTokens: 4096,
    recommended: true
  },

  'gemini-2.5-pro': {
    name: 'gemini-2.5-pro',
    fullPath: 'publishers/google/models/gemini-2.5-pro',
    description: 'Gemini 2.5 Pro - 旗舰模型，最高质量',
    pricing: '高级',
    features: ['最高质量', '复杂推理', '长文本支持'],
    maxTokens: 32768,
    recommended: false
  },

  // Gemini 2.0 系列
  'gemini-2.0-flash': {
    name: 'gemini-2.0-flash',
    fullPath: 'publishers/google/models/gemini-2.0-flash',
    description: 'Gemini 2.0 Flash - 稳定版本',
    pricing: '标准',
    features: ['稳定可靠', '广泛测试'],
    maxTokens: 8192,
    recommended: false
  },

  'gemini-2.0-flash-exp': {
    name: 'gemini-2.0-flash-exp',
    fullPath: 'publishers/google/models/gemini-2.0-flash-exp',
    description: 'Gemini 2.0 Flash 实验版',
    pricing: '标准',
    features: ['实验性功能', '可能不稳定'],
    maxTokens: 8192,
    recommended: false
  },

  // Gemini 1.5 系列（向后兼容）
  'gemini-1.5-flash': {
    name: 'gemini-1.5-flash',
    fullPath: 'publishers/google/models/gemini-1.5-flash',
    description: 'Gemini 1.5 Flash - 上代模型',
    pricing: '标准',
    features: ['向后兼容'],
    maxTokens: 8192,
    recommended: false
  },

  'gemini-1.5-pro': {
    name: 'gemini-1.5-pro',
    fullPath: 'publishers/google/models/gemini-1.5-pro',
    description: 'Gemini 1.5 Pro - 上代旗舰',
    pricing: '高级',
    features: ['高质量', '长文本'],
    maxTokens: 32768,
    recommended: false
  },

  'gemini-1.5-flash-8b': {
    name: 'gemini-1.5-flash-8b',
    fullPath: 'publishers/google/models/gemini-1.5-flash-8b',
    description: 'Gemini 1.5 Flash 8B - 超轻量',
    pricing: '极低成本',
    features: ['极快', '极低成本', '基础任务'],
    maxTokens: 8192,
    recommended: false
  }
}

/**
 * 获取当前选择的模型配置
 */
export function getCurrentModel() {
  const model = AVAILABLE_MODELS[CURRENT_MODEL]
  
  if (!model) {
    throw new Error(`未找到模型: ${CURRENT_MODEL}。请检查 CURRENT_MODEL 设置。`)
  }
  
  return model
}

/**
 * 获取所有可用模型列表
 */
export function getAllModels() {
  return Object.entries(AVAILABLE_MODELS).map(([key, model]) => ({
    key,
    ...model
  }))
}

/**
 * 获取推荐模型列表
 */
export function getRecommendedModels() {
  return Object.entries(AVAILABLE_MODELS)
    .filter(([_, model]) => model.recommended)
    .map(([key, model]) => ({
      key,
      ...model
    }))
}

/**
 * 打印当前模型信息
 */
export function printCurrentModel() {
  const model = getCurrentModel()
  
  console.log('\n' + '🤖 '.repeat(40))
  console.log('🤖 当前使用的 AI 模型')
  console.log('🤖 '.repeat(40))
  console.log(`📝 模型名称: ${model.name}`)
  console.log(`📋 描述: ${model.description}`)
  console.log(`💰 定价: ${model.pricing}`)
  console.log(`✨ 特性: ${model.features.join(', ')}`)
  console.log(`📏 最大Tokens: ${model.maxTokens}`)
  console.log(`⭐ 推荐: ${model.recommended ? '是' : '否'}`)
  console.log('🤖 '.repeat(40))
  console.log('')
}

/**
 * 打印所有可用模型
 */
export function printAllModels() {
  console.log('\n' + '=' .repeat(80))
  console.log('📚 所有可用的 Gemini 模型')
  console.log('=' .repeat(80))
  
  Object.entries(AVAILABLE_MODELS).forEach(([key, model]) => {
    const recommended = model.recommended ? ' ⭐ 推荐' : ''
    console.log(`\n${key}${recommended}`)
    console.log(`  描述: ${model.description}`)
    console.log(`  定价: ${model.pricing}`)
    console.log(`  特性: ${model.features.join(', ')}`)
  })
  
  console.log('\n' + '=' .repeat(80))
  console.log('💡 修改方法：编辑 model-switcher.js 中的 CURRENT_MODEL 变量')
  console.log('=' .repeat(80))
  console.log('')
}

export default {
  CURRENT_MODEL,
  AVAILABLE_MODELS,
  getCurrentModel,
  getAllModels,
  getRecommendedModels,
  printCurrentModel,
  printAllModels
}


