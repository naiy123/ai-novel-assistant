/**
 * 顶部导航栏组件
 * 功能：显示应用标题和用户信息
 */
function Topbar({ onLogout }) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
      {/* 左侧：Logo 和标题 */}
      <div className="flex items-center space-x-3">
        <span className="text-2xl">✍️</span>
        <h1 className="text-xl font-bold text-gray-800">AI 小说写作助手</h1>
      </div>

      {/* 右侧：用户信息和退出按钮 */}
      <div className="flex items-center space-x-4">
        {/* 用户头像 */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
            用
          </div>
          <span className="text-sm text-gray-700">用户</span>
        </div>

        {/* 退出按钮 */}
        <button
          onClick={onLogout}
          className="text-sm text-gray-600 hover:text-red-500 transition"
        >
          退出登录
        </button>
      </div>
    </header>
  )
}

export default Topbar

