/**
 * 首页组件
 * 功能：欢迎页面，显示快速开始指南
 */
function HomePage() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* 欢迎区域 */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-8 text-white mb-6">
        <h1 className="text-4xl font-bold mb-4">欢迎使用 AI 小说写作助手 ✨</h1>
        <p className="text-lg opacity-90">
          让 AI 成为你的创作伙伴，轻松创作精彩小说
        </p>
      </div>

      {/* 快速开始指南 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 步骤 1 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="text-3xl mb-3">📚</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">1. 创建小说</h3>
          <p className="text-gray-600">
            在「我的小说」页面创建你的第一部小说，设置标题、简介等基本信息
          </p>
        </div>

        {/* 步骤 2 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="text-3xl mb-3">🎴</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">2. 建立卡片库</h3>
          <p className="text-gray-600">
            创建人物卡、物品卡、背景卡，为小说构建详细的世界观
          </p>
        </div>

        {/* 步骤 3 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="text-3xl mb-3">✍️</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">3. 开始写作</h3>
          <p className="text-gray-600">
            创建章节，输入剧情大纲，选择相关卡片，让 AI 帮你生成内容
          </p>
        </div>

        {/* 步骤 4 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="text-3xl mb-3">🚀</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">4. 编辑完善</h3>
          <p className="text-gray-600">
            AI 生成初稿后，你可以自由编辑修改，打磨出完美的作品
          </p>
        </div>
      </div>

      {/* 功能特色 */}
      <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">✨ 功能特色</h2>
        <ul className="space-y-3">
          <li className="flex items-start space-x-3">
            <span className="text-green-500 mt-1">✓</span>
            <span className="text-gray-700">
              <strong>智能写作：</strong>根据你的大纲和卡片信息，AI 生成符合设定的内容
            </span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="text-green-500 mt-1">✓</span>
            <span className="text-gray-700">
              <strong>卡片系统：</strong>系统化管理角色、物品、场景，保持前后一致
            </span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="text-green-500 mt-1">✓</span>
            <span className="text-gray-700">
              <strong>多 API 支持：</strong>支持 Google Gemini 等多个 AI 接口
            </span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="text-green-500 mt-1">✓</span>
            <span className="text-gray-700">
              <strong>简单易用：</strong>清爽的界面，流畅的操作体验
            </span>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default HomePage

