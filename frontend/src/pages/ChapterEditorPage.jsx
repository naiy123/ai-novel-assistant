import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

/**
 * 章节编辑器页面
 * 功能：编辑章节内容，保存章节
 */
function ChapterEditorPage() {
  const { novelId, chapterId } = useParams()
  const navigate = useNavigate()

  // 状态管理
  const [chapter, setChapter] = useState(null)
  const [content, setContent] = useState('') // 章节内容
  const [title, setTitle] = useState('') // 章节标题
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false) // 保存状态

  // 页面加载时获取章节数据
  useEffect(() => {
    fetchChapter()
  }, [chapterId])

  // 获取章节详情
  const fetchChapter = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/novels/${novelId}`)
      const data = await response.json()

      if (response.ok) {
        // 从章节列表中找到当前章节
        const currentChapter = data.chapters.find(
          ch => ch.id === parseInt(chapterId)
        )
        
        if (currentChapter) {
          setChapter(currentChapter)
          setTitle(currentChapter.title)
          setContent(currentChapter.content || '')
        } else {
          alert('章节不存在')
          navigate(`/novels/${novelId}`)
        }
      }
    } catch (error) {
      console.error('获取章节失败:', error)
      alert('获取章节失败')
    } finally {
      setLoading(false)
    }
  }

  // 保存章节
  const handleSave = async () => {
    try {
      setSaving(true)

      // 计算字数
      const wordCount = content.length

      const response = await fetch(`/api/novels/${novelId}/chapters/${chapterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          word_count: wordCount
        })
      })

      if (response.ok) {
        alert('保存成功！')
      } else {
        alert('保存失败')
      }
    } catch (error) {
      console.error('保存章节失败:', error)
      alert('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  // 返回小说详情页
  const goBack = () => {
    navigate(`/novels/${novelId}`)
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">⏳</div>
        <p className="text-gray-500">加载中...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* 顶部工具栏 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4 flex items-center justify-between">
        {/* 左侧：返回按钮 */}
        <button
          onClick={goBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition"
        >
          <span>←</span>
          <span>返回</span>
        </button>

        {/* 中间：章节信息 */}
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>第 {chapter?.chapter_number || '-'} 章</span>
          <span>|</span>
          <span>字数：{content.length}</span>
        </div>

        {/* 右侧：保存按钮 */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? '保存中...' : '💾 保存'}
        </button>
      </div>

      {/* 编辑区域 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        {/* 章节标题输入 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            章节标题
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="请输入章节标题"
            className="w-full px-4 py-3 text-2xl font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        {/* 章节内容输入 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            章节内容
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="开始写作..."
            className="w-full h-96 px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none leading-relaxed"
            style={{ lineHeight: '1.8' }}
          />
          <p className="text-xs text-gray-500 mt-2">
            提示：可以使用 AI 写作功能辅助创作（功能开发中）
          </p>
        </div>

        {/* AI 写作工具栏（占位） */}
        <div className="mt-6 p-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-700">🤖 AI 写作助手</h4>
              <p className="text-sm text-gray-500 mt-1">
                选择卡片和输入大纲，让 AI 帮你生成内容
              </p>
            </div>
            <button
              disabled
              className="px-6 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
            >
              即将上线
            </button>
          </div>
        </div>
      </div>

      {/* 快捷键提示 */}
      <div className="mt-4 text-center text-sm text-gray-500">
        💡 提示：记得随时保存你的创作
      </div>
    </div>
  )
}

export default ChapterEditorPage


