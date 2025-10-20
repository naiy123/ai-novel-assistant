/**
 * 设置页面
 * 功能：配置 AI API、用户偏好等
 */
function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">设置</h1>
        <p className="text-gray-500">配置你的 AI 写作助手</p>
      </div>

      {/* API 配置 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">🔑</span>
          API 配置
        </h2>
        
        <div className="space-y-4">
          {/* API 选择 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择 AI 服务
            </label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
              <option>Google Gemini</option>
              <option>OpenAI GPT</option>
              <option>Claude</option>
              <option>其他</option>
            </select>
          </div>

          {/* API Key 输入 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key
            </label>
            <input
              type="password"
              placeholder="请输入你的 API Key"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              你的 API Key 将被安全加密存储
            </p>
          </div>

          {/* 保存按钮 */}
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition">
            保存设置
          </button>
        </div>
      </div>

      {/* 写作偏好 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">✍️</span>
          写作偏好
        </h2>
        
        <div className="space-y-4">
          {/* 写作风格 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              默认写作风格
            </label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
              <option>现代都市</option>
              <option>古代武侠</option>
              <option>玄幻奇幻</option>
              <option>科幻未来</option>
              <option>悬疑推理</option>
            </select>
          </div>

          {/* 生成长度 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              默认生成长度
            </label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
              <option>短（约 500 字）</option>
              <option>中（约 1000 字）</option>
              <option>长（约 2000 字）</option>
            </select>
          </div>

          {/* 保存按钮 */}
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition">
            保存偏好
          </button>
        </div>
      </div>

      {/* 关于 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">ℹ️</span>
          关于
        </h2>
        <div className="space-y-2 text-gray-600">
          <p><strong>版本：</strong>v1.0.0 (MVP)</p>
          <p><strong>开发：</strong>AI 小说写作助手团队</p>
          <p><strong>说明：</strong>这是 MVP 版本，更多功能正在开发中</p>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage

