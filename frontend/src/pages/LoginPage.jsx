import { useState } from 'react'

/**
 * 登录页面组件
 * 功能：简单的登录界面（MVP 版本，点击即可登录）
 */
function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  // 处理登录按钮点击
  const handleSubmit = (e) => {
    e.preventDefault()
    // MVP 版本：不验证，直接登录
    // 后续可以添加真实的登录验证
    if (username && password) {
      onLogin()
    } else {
      alert('请输入用户名和密码')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Logo 和标题 */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">✍️</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">AI 小说写作助手</h1>
          <p className="text-gray-500">让 AI 帮你创作精彩小说</p>
        </div>

        {/* 登录表单 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 用户名输入框 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              用户名
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="请输入用户名"
            />
          </div>

          {/* 密码输入框 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="请输入密码"
            />
          </div>

          {/* 登录按钮 */}
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
          >
            登录
          </button>

          {/* 提示信息 */}
          <p className="text-center text-sm text-gray-500 mt-4">
            MVP 版本：输入任意用户名密码即可登录
          </p>
        </form>

        {/* 底部信息 */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            还没有账号？
            <span className="text-blue-500 cursor-pointer hover:underline ml-1">
              立即注册
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage

