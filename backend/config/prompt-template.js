/**
 * AI 提示词模板配置文件
 * 这是整个 AI 写作系统的核心配置
 * 
 * 作用：
 * 1. 定义系统基础提示词（对用户隐藏）
 * 2. 定义如何组合各类卡片信息
 * 3. 控制写作风格、字数等参数
 * 
 * 修改建议：
 * - 每次调整后建议测试生成效果
 * - 可以根据不同小说类型调整系统提示词
 * - 字数控制可能需要多次调整才能达到理想效果
 */

/**
 * 系统基础提示词
 * 这部分用户看不到，但会影响 AI 的整体写作风格
 */
const SYSTEM_PROMPT = `你是一位经验丰富的网络小说作家，擅长创作引人入胜的故事。

写作要求：
1. 文笔流畅，情节紧凑，节奏把控得当
2. 人物性格鲜明，对话符合人物设定
3. 场景描写生动，营造沉浸感
4. 保持悬念，不要轻易结束剧情
5. 尊重用户提供的人物、物品、场景设定
6. 严格按照用户的剧情大纲发展故事

写作风格：
- 使用第三人称视角
- 多用动作描写和对话推动剧情
- 适当加入心理描写增加深度
- 避免过度说教，让情节自然展开

禁止事项：
- 不要擅自结束故事或进入大结局
- 不要改变已设定的人物性格
- 不要无视用户提供的背景设定
- 不要生成暴力、色情、政治敏感内容`

/**
 * 字数控制提示词
 * 用于要求 AI 生成特定字数的内容
 * 
 * @param {number} targetWords - 目标字数（默认 2000 字）
 * @returns {string} 字数控制提示
 */
function getWordCountPrompt(targetWords = 2000) {
  return `\n\n字数要求：
- 本次续写内容应在 ${targetWords - 500} 到 ${targetWords + 500} 字之间
- 力求完整表达一个情节段落
- 不要为了凑字数而注水
- 不要因为字数限制而仓促收尾`
}

/**
 * 组合人物卡信息
 * 将用户选中的人物卡转换为提示词格式
 * 
 * @param {Array} characters - 人物卡数组
 * @returns {string} 格式化的人物卡提示词
 */
function formatCharacterPrompt(characters) {
  if (!characters || characters.length === 0) {
    return ''
  }

  let prompt = '\n\n## 相关人物设定\n'
  prompt += '以下人物必须在本次内容中出现或被提及：\n\n'

  characters.forEach((char, index) => {
    prompt += `### ${index + 1}. ${char.name}\n`
    
    // 基础信息
    const basicInfo = []
    if (char.age) basicInfo.push(`年龄：${char.age}岁`)
    if (char.gender) basicInfo.push(`性别：${char.gender}`)
    if (basicInfo.length > 0) {
      prompt += `**基础信息**：${basicInfo.join('，')}\n`
    }

    // 性格特征
    if (char.personality) {
      prompt += `**性格特征**：${char.personality}\n`
    }

    // 外貌描写
    if (char.appearance) {
      prompt += `**外貌特征**：${char.appearance}\n`
    }

    // 背景故事
    if (char.background) {
      prompt += `**背景故事**：${char.background}\n`
    }

    // 其他补充信息
    if (char.other_info) {
      prompt += `**补充信息**：${char.other_info}\n`
    }

    prompt += '\n'
  })

  prompt += '**注意**：写作时请严格遵守以上人物设定，保持人物行为和对话符合其性格特征。\n'

  return prompt
}

/**
 * 组合物品卡信息
 * 将用户选中的物品卡转换为提示词格式
 * 
 * @param {Array} items - 物品卡数组
 * @returns {string} 格式化的物品卡提示词
 */
function formatItemPrompt(items) {
  if (!items || items.length === 0) {
    return ''
  }

  let prompt = '\n\n## 相关物品设定\n'
  prompt += '以下物品应在剧情中发挥作用：\n\n'

  items.forEach((item, index) => {
    prompt += `### ${index + 1}. ${item.name}\n`

    // 稀有度
    if (item.rarity) {
      prompt += `**稀有度**：${item.rarity}\n`
    }

    // 物品描述
    if (item.description) {
      prompt += `**外观描述**：${item.description}\n`
    }

    // 物品作用
    if (item.function) {
      prompt += `**功能作用**：${item.function}\n`
    }

    // 其他补充信息
    if (item.other_info) {
      prompt += `**补充信息**：${item.other_info}\n`
    }

    prompt += '\n'
  })

  prompt += '**注意**：物品的使用要符合其设定的功能，不要随意改变物品属性。\n'

  return prompt
}

/**
 * 组合场景卡信息
 * 将用户选中的场景卡转换为提示词格式
 * 
 * @param {Object} scene - 场景卡对象（单选）
 * @returns {string} 格式化的场景卡提示词
 */
function formatScenePrompt(scene) {
  if (!scene) {
    return ''
  }

  let prompt = '\n\n## 场景背景设定\n'
  prompt += `### 场景：${scene.name}\n\n`

  // 时代背景
  if (scene.time_period) {
    prompt += `**时代背景**：${scene.time_period}\n`
  }

  // 氛围基调
  if (scene.atmosphere) {
    prompt += `**氛围基调**：${scene.atmosphere}\n`
  }

  // 场景详细描述
  if (scene.description) {
    prompt += `**场景详情**：${scene.description}\n`
  }

  // 特殊功能/特色
  if (scene.special_features) {
    prompt += `**特殊功能**：${scene.special_features}\n`
  }

  prompt += '\n**注意**：写作时要充分体现场景的特点和氛围，让读者有身临其境的感觉。\n'

  return prompt
}

/**
 * 组合剧情大纲
 * 将用户输入的剧情大纲格式化
 * 
 * @param {string} outline - 用户输入的剧情大纲
 * @returns {string} 格式化的剧情大纲提示词
 */
function formatOutlinePrompt(outline) {
  if (!outline || outline.trim() === '') {
    return '\n\n## 剧情大纲\n（用户未提供具体大纲，请根据上文自然发展）\n'
  }

  return `\n\n## 剧情大纲
用户希望接下来的剧情发展如下：

${outline}

**注意**：这是用户明确要求的剧情走向，必须严格按照此大纲展开，不可偏离主题。\n`
}

/**
 * 生成完整的提示词
 * 这是最核心的函数，将所有信息组合成最终发送给 AI 的提示词
 * 
 * @param {Object} params - 参数对象
 * @param {string} params.outline - 剧情大纲（必填）
 * @param {Array} params.characters - 人物卡数组
 * @param {Array} params.items - 物品卡数组
 * @param {Object} params.scene - 场景卡对象
 * @param {string} params.previousContent - 之前的章节内容（可选，用于上下文连贯）
 * @param {number} params.targetWords - 目标字数
 * @returns {string} 完整的提示词
 */
function generateFullPrompt({
  outline,
  characters = [],
  items = [],
  scene = null,
  previousContent = '',
  targetWords = 2000
}) {
  // 构建完整提示词
  let fullPrompt = SYSTEM_PROMPT

  // 添加字数控制
  fullPrompt += getWordCountPrompt(targetWords)

  // 如果有之前的内容，加入上下文
  if (previousContent && previousContent.trim()) {
    fullPrompt += '\n\n## 上文内容（用于保持连贯性）\n'
    // 只取最后 500 字作为上下文，避免 token 过多
    const contextLength = 500
    const context = previousContent.length > contextLength 
      ? '...' + previousContent.slice(-contextLength)
      : previousContent
    fullPrompt += `${context}\n`
    fullPrompt += '\n**注意**：续写内容需要与上文自然衔接，保持故事连贯性。\n'
  }

  // 添加场景设定（场景应该最先确定）
  if (scene) {
    fullPrompt += formatScenePrompt(scene)
  }

  // 添加人物设定
  if (characters && characters.length > 0) {
    fullPrompt += formatCharacterPrompt(characters)
  }

  // 添加物品设定
  if (items && items.length > 0) {
    fullPrompt += formatItemPrompt(items)
  }

  // 添加剧情大纲（这是用户最核心的输入）
  fullPrompt += formatOutlinePrompt(outline)

  // 添加最终指令
  fullPrompt += '\n\n---\n\n'
  fullPrompt += '请基于以上所有设定和要求，开始创作续写内容。记住：\n'
  fullPrompt += '1. 严格遵守所有人物、物品、场景设定\n'
  fullPrompt += '2. 紧扣剧情大纲展开故事\n'
  fullPrompt += '3. 保持文笔流畅，节奏紧凑\n'
  fullPrompt += '4. 字数控制在指定范围内\n'
  fullPrompt += '5. 不要提前结束故事\n\n'
  fullPrompt += '现在开始创作：\n'

  return fullPrompt
}

/**
 * 导出所有函数和配置
 */
export {
  SYSTEM_PROMPT,
  getWordCountPrompt,
  formatCharacterPrompt,
  formatItemPrompt,
  formatScenePrompt,
  formatOutlinePrompt,
  generateFullPrompt
}

export default {
  SYSTEM_PROMPT,
  getWordCountPrompt,
  formatCharacterPrompt,
  formatItemPrompt,
  formatScenePrompt,
  formatOutlinePrompt,
  generateFullPrompt
}

