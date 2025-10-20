import { Link } from 'react-router-dom'

/**
 * 侧边栏组件
 * 功能：显示导航菜单
 */
function Sidebar({ currentPath }) {
  // 菜单项配置
  const menuItems = [
    { path: '/home', icon: '🏠', label: '首页' },
    { path: '/novels', icon: '📚', label: '我的小说' },
    { path: '/cards', icon: '🎴', label: '卡片库' },
  ]

  return (
    <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            // 判断是否为当前页面
            const isActive = currentPath === item.path || 
                           (item.path === '/home' && currentPath === '/')
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-lg transition
                    ${isActive 
                      ? 'bg-blue-50 text-blue-600 font-medium' 
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* 底部提示信息 */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-500 text-center">
          AI 小说写作助手 v1.0
        </p>
        <p className="text-xs text-gray-400 text-center mt-1">
          MVP 版本
        </p>
      </div>
    </aside>
  )
}

export default Sidebar

