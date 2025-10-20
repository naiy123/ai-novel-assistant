import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import HomePage from './HomePage'
import NovelsPage from './NovelsPage'
import NovelDetailPage from './NovelDetailPage'
import ChapterEditorPage from './ChapterEditorPage'
import CardsPage from './CardsPage'

/**
 * 主布局组件
 * 功能：包含顶部导航栏、侧边栏和内容区域
 */
function MainLayout({ onLogout }) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 顶部导航栏 */}
      <Topbar onLogout={onLogout} />

      {/* 主内容区域：侧边栏 + 内容区 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧边栏 */}
        <Sidebar currentPath={location.pathname} />

        {/* 右侧内容区 */}
        <main className="flex-1 overflow-auto p-6">
          <Routes>
            {/* 首页 */}
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
            
            {/* 小说管理 */}
            <Route path="/novels" element={<NovelsPage />} />
            <Route path="/novels/:novelId" element={<NovelDetailPage />} />
            <Route path="/novels/:novelId/chapters/:chapterId" element={<ChapterEditorPage />} />
            
            {/* 卡片库页 */}
            <Route path="/cards" element={<CardsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default MainLayout

