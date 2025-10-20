import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * 小说管理页面
 * 功能：显示小说列表，可以创建、编辑、删除小说
 */
function NovelsPage() {
  const navigate = useNavigate()
  
  // 状态管理
  const [novels, setNovels] = useState([]) // 小说列表
  const [loading, setLoading] = useState(true) // 加载状态
  const [showCreateModal, setShowCreateModal] = useState(false) // 显示新建对话框
  const [newNovelTitle, setNewNovelTitle] = useState('') // 新建小说标题

  // 页面加载时获取小说列表
  useEffect(() => {
    fetchNovels()
  }, [])

  // 获取小说列表
  const fetchNovels = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/novels')
      const data = await response.json()
      setNovels(data.novels || [])
    } catch (error) {
      console.error('获取小说列表失败:', error)
      alert('获取小说列表失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 创建新小说
  const handleCreateNovel = async () => {
    if (!newNovelTitle.trim()) {
      alert('请输入小说名称')
      return
    }

    try {
      const response = await fetch('/api/novels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: newNovelTitle,
          description: '',
          genre: '其他'
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        alert('创建成功！')
        setShowCreateModal(false)
        setNewNovelTitle('')
        fetchNovels() // 刷新列表
      } else {
        alert(data.error || '创建失败')
      }
    } catch (error) {
      console.error('创建小说失败:', error)
      alert('创建失败，请重试')
    }
  }

  // 删除小说
  const handleDeleteNovel = async (id, title) => {
    if (!confirm(`确定要删除小说《${title}》吗？`)) {
      return
    }

    try {
      const response = await fetch(`/api/novels/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('删除成功！')
        fetchNovels() // 刷新列表
      } else {
        alert('删除失败')
      }
    } catch (error) {
      console.error('删除小说失败:', error)
      alert('删除失败，请重试')
    }
  }

  // 跳转到小说详情页
  const goToNovelDetail = (novelId) => {
    navigate(`/novels/${novelId}`)
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* 页面标题和新建按钮 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">我的小说</h1>
          <p className="text-gray-500">管理你的所有小说作品</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition shadow-md hover:shadow-lg flex items-center space-x-2"
        >
          <span>+</span>
          <span>新建小说</span>
        </button>
      </div>

      {/* 加载状态 */}
      {loading && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-500">加载中...</p>
        </div>
      )}

      {/* 小说列表 */}
      {!loading && novels.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">还没有小说</h3>
            <p className="text-gray-500 mb-4">点击右上角的「新建小说」开始创作吧！</p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition"
            >
              创建第一部小说
            </button>
          </div>
        </div>
      )}

      {/* 小说卡片列表 */}
      {!loading && novels.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {novels.map(novel => (
            <div 
              key={novel.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition cursor-pointer"
              onClick={() => goToNovelDetail(novel.id)}
            >
              {/* 小说标题 */}
              <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                {novel.title}
              </h3>

              {/* 小说信息 */}
              <div className="text-sm text-gray-500 space-y-1 mb-4">
                <p>类型：{novel.genre || '未分类'}</p>
                <p>状态：{novel.status === 'writing' ? '连载中' : '已完结'}</p>
                <p>创建时间：{new Date(novel.created_at).toLocaleDateString()}</p>
              </div>

              {/* 操作按钮 */}
              <div className="flex space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    goToNovelDetail(novel.id)
                  }}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition"
                >
                  查看详情
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteNovel(novel.id, novel.title)
                  }}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm transition"
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 新建小说对话框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">新建小说</h2>
            
            {/* 输入框 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                小说名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newNovelTitle}
                onChange={(e) => setNewNovelTitle(e.target.value)}
                placeholder="请输入小说名称"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
                创建后可以在小说详情页添加章节和卡片
              </p>
            </div>

            {/* 按钮 */}
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setNewNovelTitle('')
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                取消
              </button>
              <button
                onClick={handleCreateNovel}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NovelsPage

