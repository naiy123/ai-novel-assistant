import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

/**
 * 小说详情页面 - 集成写作界面
 * 功能：左侧章节管理，中间编辑器，类似专业写作软件
 */
function NovelDetailPage() {
  const { novelId } = useParams()
  const navigate = useNavigate()

  // 状态管理
  const [novel, setNovel] = useState(null)
  const [chapters, setChapters] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newChapterTitle, setNewChapterTitle] = useState('')
  
  // 新增状态
  const [sidebarVisible, setSidebarVisible] = useState(true) // 侧边栏可见性
  const [currentChapterId, setCurrentChapterId] = useState(null) // 当前选中的章节
  const [currentChapter, setCurrentChapter] = useState(null) // 当前章节数据
  const [chapterTitle, setChapterTitle] = useState('') // 当前章节标题
  const [chapterContent, setChapterContent] = useState('') // 当前章节内容
  const [saving, setSaving] = useState(false) // 保存状态
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false) // 未保存标记
  const [autoSaving, setAutoSaving] = useState(false) // 自动保存状态

  // AI 写作面板状态
  const [aiPanelVisible, setAiPanelVisible] = useState(false) // AI 面板可见性
  const [aiOutline, setAiOutline] = useState('') // 剧情大纲
  const [selectedCharacters, setSelectedCharacters] = useState([]) // 选中的人物卡
  const [selectedItems, setSelectedItems] = useState([]) // 选中的物品卡
  const [selectedScene, setSelectedScene] = useState(null) // 选中的背景卡
  const [targetWords, setTargetWords] = useState(1000) // 目标生成字数
  const [generating, setGenerating] = useState(false) // AI 生成状态
  const [isContinueWriting, setIsContinueWriting] = useState(true) // 是否续写模式
  const [useStealthMode, setUseStealthMode] = useState(false) // 是否使用反检测模式
  
  // 卡片数据
  const [characters, setCharacters] = useState([]) // 人物卡列表
  const [items, setItems] = useState([]) // 物品卡列表
  const [scenes, setScenes] = useState([]) // 背景卡列表
  const [cardsLoading, setCardsLoading] = useState(false) // 卡片加载状态
  
  // 卡片选择弹窗状态
  const [showCharacterModal, setShowCharacterModal] = useState(false) // 人物卡选择弹窗
  const [showItemModal, setShowItemModal] = useState(false) // 物品卡选择弹窗
  const [showSceneModal, setShowSceneModal] = useState(false) // 场景卡选择弹窗
  
  // 卡片展开状态（用于控制详情显示）
  const [expandedCharacters, setExpandedCharacters] = useState([]) // 展开的人物卡ID列表
  const [expandedItems, setExpandedItems] = useState([]) // 展开的物品卡ID列表
  const [expandedScenes, setExpandedScenes] = useState([]) // 展开的场景卡ID列表
  
  // 文本选择功能状态
  const [selectedText, setSelectedText] = useState('') // 选中的文本
  const [selectionMenu, setSelectionMenu] = useState({ show: false, x: 0, y: 0 }) // 浮动菜单位置
  const [showDiscussModal, setShowDiscussModal] = useState(false) // 讨论弹窗
  const [showRewriteModal, setShowRewriteModal] = useState(false) // 修改弹窗
  const [discussionResult, setDiscussionResult] = useState('') // AI讨论结果
  const [rewriteInstruction, setRewriteInstruction] = useState('') // 修改指令
  const [rewriteMode, setRewriteMode] = useState('expand') // 修改模式：expand/shrink/rewrite
  const [rewriteTargetWords, setRewriteTargetWords] = useState(100) // 目标字数
  const [discussing, setDiscussing] = useState(false) // 讨论中状态
  const [rewriting, setRewriting] = useState(false) // 修改中状态

  // 页面加载时获取数据
  useEffect(() => {
    fetchNovelDetail()
    fetchAllCards() // 获取卡片数据
  }, [novelId])

  // 当章节列表加载后，自动选中第一章
  useEffect(() => {
    if (chapters.length > 0 && !currentChapterId) {
      selectChapter(chapters[0].id)
    }
  }, [chapters])

  // 自动保存功能：在内容变化后 3 秒自动保存
  useEffect(() => {
    if (!currentChapterId || !hasUnsavedChanges) {
      return
    }

    const autoSaveTimer = setTimeout(async () => {
      console.log('💾 自动保存中...')
      setAutoSaving(true)
      try {
        const wordCount = chapterContent.length
        const response = await fetch(`/api/novels/${novelId}/chapters/${currentChapterId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: chapterTitle,
            content: chapterContent,
            word_count: wordCount
          })
        })

        if (response.ok) {
          setHasUnsavedChanges(false)
          console.log('✅ 自动保存成功')
          // 更新章节列表中的数据
          const updatedChapters = chapters.map(ch => 
            ch.id === currentChapterId 
              ? { ...ch, title: chapterTitle, content: chapterContent, word_count: wordCount }
              : ch
          )
          setChapters(updatedChapters)
        }
      } catch (error) {
        console.error('❌ 自动保存失败:', error)
      } finally {
        setAutoSaving(false)
      }
    }, 3000) // 3 秒后自动保存

    return () => clearTimeout(autoSaveTimer)
  }, [chapterContent, chapterTitle, currentChapterId, hasUnsavedChanges])

  // 获取所有卡片数据
  const fetchAllCards = async () => {
    setCardsLoading(true)
    try {
      // 使用小说ID=1作为示例（实际应该是作者级别）
      const cardNovelId = 1

      const [charRes, itemRes, sceneRes] = await Promise.all([
        fetch(`/api/cards/characters/${cardNovelId}`),
        fetch(`/api/cards/items/${cardNovelId}`),
        fetch(`/api/cards/scenes/${cardNovelId}`)
      ])

      const charData = await charRes.json()
      const itemData = await itemRes.json()
      const sceneData = await sceneRes.json()

      setCharacters(charData.characters || [])
      setItems(itemData.items || [])
      setScenes(sceneData.scenes || [])
    } catch (error) {
      console.error('获取卡片失败:', error)
    } finally {
      setCardsLoading(false)
    }
  }

  // 获取小说详情和章节列表
  const fetchNovelDetail = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/novels/${novelId}`)
      const data = await response.json()
      
      if (response.ok) {
        setNovel(data.novel)
        setChapters(data.chapters || [])
      } else {
        alert('获取小说信息失败')
        navigate('/novels')
      }
    } catch (error) {
      console.error('获取小说详情失败:', error)
      alert('获取失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 选择章节
  const selectChapter = (chapterId) => {
    // 如果有未保存的修改，提示用户
    if (hasUnsavedChanges) {
      if (!confirm('当前章节有未保存的修改，是否放弃并切换？')) {
        return
      }
    }

    const chapter = chapters.find(ch => ch.id === chapterId)
    if (chapter) {
      setCurrentChapterId(chapterId)
      setCurrentChapter(chapter)
      setChapterTitle(chapter.title)
      setChapterContent(chapter.content || '')
      setHasUnsavedChanges(false)
    }
  }

  // 监听内容变化
  const handleContentChange = (newContent) => {
    setChapterContent(newContent)
    setHasUnsavedChanges(true)
  }

  const handleTitleChange = (newTitle) => {
    setChapterTitle(newTitle)
    setHasUnsavedChanges(true)
  }

  // 保存当前章节
  const handleSaveChapter = async () => {
    if (!currentChapterId) {
      alert('请先选择一个章节')
      return
    }

    try {
      setSaving(true)
      const wordCount = chapterContent.length

      const response = await fetch(`/api/novels/${novelId}/chapters/${currentChapterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: chapterTitle,
          content: chapterContent,
          word_count: wordCount
        })
      })

      if (response.ok) {
        alert('💾 保存成功！')
        setHasUnsavedChanges(false)
        // 更新章节列表中的数据
        const updatedChapters = chapters.map(ch => 
          ch.id === currentChapterId 
            ? { ...ch, title: chapterTitle, content: chapterContent, word_count: wordCount }
            : ch
        )
        setChapters(updatedChapters)
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

  // 创建新章节
  const handleCreateChapter = async () => {
    if (!newChapterTitle.trim()) {
      alert('请输入章节标题')
      return
    }

    try {
      const chapterNumber = chapters.length + 1

      const response = await fetch(`/api/novels/${novelId}/chapters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newChapterTitle,
          content: '',
          chapterNumber
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert('✅ 创建成功！')
        setShowCreateModal(false)
        setNewChapterTitle('')
        await fetchNovelDetail() // 刷新章节列表
        // 自动选中新创建的章节
        setTimeout(() => {
          selectChapter(data.chapterId)
        }, 100)
      } else {
        alert(data.error || '创建失败')
      }
    } catch (error) {
      console.error('创建章节失败:', error)
      alert('创建失败，请重试')
    }
  }

  // 删除章节
  const handleDeleteChapter = async (chapterId, chapterTitle) => {
    if (!confirm(`确定要删除《${chapterTitle}》吗？删除后无法恢复！`)) {
      return
    }

    try {
      const response = await fetch(`/api/novels/${novelId}/chapters/${chapterId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('🗑️ 删除成功！')
        // 如果删除的是当前章节，清空编辑器
        if (chapterId === currentChapterId) {
          setCurrentChapterId(null)
          setCurrentChapter(null)
          setChapterTitle('')
          setChapterContent('')
        }
        fetchNovelDetail() // 刷新列表
      } else {
        alert('删除失败')
      }
    } catch (error) {
      console.error('删除章节失败:', error)
      alert('删除失败，请重试')
    }
  }

  // 返回小说列表
  const goBack = () => {
    if (hasUnsavedChanges) {
      if (!confirm('当前章节有未保存的修改，确定要离开吗？')) {
        return
      }
    }
    navigate('/novels')
  }

  // 切换侧边栏
  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible)
  }

  // 切换 AI 面板
  const toggleAiPanel = () => {
    setAiPanelVisible(!aiPanelVisible)
  }

  // 处理人物卡选择
  const toggleCharacter = (charId) => {
    if (selectedCharacters.includes(charId)) {
      setSelectedCharacters(selectedCharacters.filter(id => id !== charId))
    } else {
      setSelectedCharacters([...selectedCharacters, charId])
    }
  }

  // 处理物品卡选择
  const toggleItem = (itemId) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter(id => id !== itemId))
    } else {
      setSelectedItems([...selectedItems, itemId])
    }
  }

  // 处理背景卡选择（单选）
  const selectSceneCard = (sceneId) => {
    setSelectedScene(sceneId === selectedScene ? null : sceneId)
  }

  // 切换人物卡展开状态
  const toggleCharacterExpand = (charId) => {
    if (expandedCharacters.includes(charId)) {
      setExpandedCharacters(expandedCharacters.filter(id => id !== charId))
    } else {
      setExpandedCharacters([...expandedCharacters, charId])
    }
  }

  // 切换物品卡展开状态
  const toggleItemExpand = (itemId) => {
    if (expandedItems.includes(itemId)) {
      setExpandedItems(expandedItems.filter(id => id !== itemId))
    } else {
      setExpandedItems([...expandedItems, itemId])
    }
  }

  // 切换场景卡展开状态
  const toggleSceneExpand = (sceneId) => {
    if (expandedScenes.includes(sceneId)) {
      setExpandedScenes(expandedScenes.filter(id => id !== sceneId))
    } else {
      setExpandedScenes([...expandedScenes, sceneId])
    }
  }

  // 处理文本选择（使用鼠标位置）
  const handleTextSelection = (e) => {
    // 延迟执行，确保选择已完成
    setTimeout(() => {
      const selection = window.getSelection()
      const text = selection.toString().trim()
      
      if (text.length > 0) {
        // 使用鼠标松开时的位置
        const menuX = e.clientX
        const menuY = e.clientY + 10  // 鼠标下方10px
        
        setSelectedText(text)
        setSelectionMenu({
          show: true,
          x: menuX,
          y: menuY
        })
        
        console.log('📍 选中文本:', text.substring(0, 20) + '...')
        console.log('📍 鼠标位置:', `x: ${e.clientX}, y: ${e.clientY}`)
        console.log('📍 菜单位置:', `x: ${menuX}, y: ${menuY}`)
      }
    }, 100)
  }

  // 隐藏选择菜单
  const hideSelectionMenu = () => {
    setSelectionMenu({ show: false, x: 0, y: 0 })
  }

  // 处理编辑器点击（隐藏菜单，但不干扰文本选择）
  const handleEditorClick = (e) => {
    // 检查是否有选中文本
    setTimeout(() => {
      const selection = window.getSelection()
      const text = selection.toString().trim()
      
      // 如果没有选中文本，隐藏菜单
      if (text.length === 0) {
        hideSelectionMenu()
      }
    }, 50)
  }

  // 打开讨论弹窗
  const openDiscussModal = () => {
    setShowDiscussModal(true)
    setDiscussionResult('')
    hideSelectionMenu()
  }

  // 打开修改弹窗
  const openRewriteModal = () => {
    // 重置为扩写模式
    setRewriteMode('expand')
    // 根据选中文本长度计算字数范围
    const originalLength = selectedText.length
    setRewriteTargetWords(Math.floor(originalLength * 1.5)) // 默认1.5倍
    setRewriteInstruction('')
    setShowRewriteModal(true)
    hideSelectionMenu()
  }

  // 监听修改模式变化，自动调整目标字数
  useEffect(() => {
    if (showRewriteModal && selectedText) {
      const range = getWordRange()
      setRewriteTargetWords(range.default)
    }
  }, [rewriteMode])

  // 全局点击事件：点击浮动菜单外部时隐藏菜单
  useEffect(() => {
    const handleGlobalClick = (e) => {
      // 如果点击的不是浮动菜单本身，隐藏菜单
      if (selectionMenu.show && !e.target.closest('.selection-menu')) {
        // 延迟隐藏，避免干扰选择操作
        setTimeout(() => {
          const selection = window.getSelection()
          if (!selection.toString().trim()) {
            hideSelectionMenu()
          }
        }, 100)
      }
    }

    document.addEventListener('mousedown', handleGlobalClick)
    return () => document.removeEventListener('mousedown', handleGlobalClick)
  }, [selectionMenu.show])

  // 计算字数范围
  const getWordRange = () => {
    const originalLength = selectedText.length
    
    switch (rewriteMode) {
      case 'expand': // 扩写：最多5倍
        return {
          min: originalLength,
          max: originalLength * 5,
          default: Math.floor(originalLength * 1.5)
        }
      case 'shrink': // 缩写：最少10%
        return {
          min: Math.floor(originalLength * 0.1),
          max: originalLength,
          default: Math.floor(originalLength * 0.6)
        }
      case 'rewrite': // 改写：上下浮动10%
        return {
          min: Math.floor(originalLength * 0.9),
          max: Math.floor(originalLength * 1.1),
          default: originalLength
        }
      default:
        return { min: 10, max: 1000, default: 100 }
    }
  }

  // AI 讨论选中文本
  const handleDiscuss = async () => {
    if (!selectedText.trim()) {
      alert('请先选择要讨论的文本')
      return
    }

    try {
      setDiscussing(true)
      
      const response = await fetch('/api/ai/discuss', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedText: selectedText,
          novelContext: chapterContent
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setDiscussionResult(data.discussion)
      } else {
        throw new Error(data.error || '讨论失败')
      }
    } catch (error) {
      alert('❌ 讨论失败：' + error.message)
    } finally {
      setDiscussing(false)
    }
  }

  // AI 修改选中文本
  const handleRewrite = async () => {
    if (!selectedText.trim()) {
      alert('请先选择要修改的文本')
      return
    }

    if (!rewriteInstruction.trim()) {
      alert('请输入修改思路')
      return
    }

    try {
      setRewriting(true)
      
      const response = await fetch('/api/ai/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalText: selectedText,
          instruction: rewriteInstruction,
          mode: rewriteMode,
          targetWords: rewriteTargetWords
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // 替换选中的文本
        const newContent = chapterContent.replace(selectedText, data.rewrittenText)
        setChapterContent(newContent)
        setHasUnsavedChanges(true)
        setShowRewriteModal(false)
        setRewriteInstruction('')
        alert('✅ 文本已修改！')
      } else {
        throw new Error(data.error || '修改失败')
      }
    } catch (error) {
      alert('❌ 修改失败：' + error.message)
    } finally {
      setRewriting(false)
    }
  }

  // 生成提示词
  const generatePrompt = () => {
    let prompt = '# AI 写作提示词\n\n'

    // 添加剧情大纲
    if (aiOutline.trim()) {
      prompt += `## 剧情大纲\n${aiOutline}\n\n`
    }

    // 添加人物卡信息
    if (selectedCharacters.length > 0) {
      prompt += '## 相关人物\n'
      selectedCharacters.forEach(charId => {
        const char = characters.find(c => c.id === charId)
        if (char) {
          prompt += `### ${char.name}\n`
          if (char.age) prompt += `- 年龄：${char.age}岁\n`
          if (char.gender) prompt += `- 性别：${char.gender}\n`
          if (char.personality) prompt += `- 性格：${char.personality}\n`
          if (char.appearance) prompt += `- 外貌：${char.appearance}\n`
          if (char.background) prompt += `- 背景：${char.background}\n`
          prompt += '\n'
        }
      })
    }

    // 添加物品卡信息
    if (selectedItems.length > 0) {
      prompt += '## 相关物品\n'
      selectedItems.forEach(itemId => {
        const item = items.find(i => i.id === itemId)
        if (item) {
          prompt += `### ${item.name}\n`
          if (item.rarity) prompt += `- 稀有度：${item.rarity}\n`
          if (item.description) prompt += `- 描述：${item.description}\n`
          if (item.function) prompt += `- 作用：${item.function}\n`
          prompt += '\n'
        }
      })
    }

    // 添加背景卡信息
    if (selectedScene) {
      const scene = scenes.find(s => s.id === selectedScene)
      if (scene) {
        prompt += '## 场景背景\n'
        prompt += `### ${scene.name}\n`
        if (scene.time_period) prompt += `- 时期：${scene.time_period}\n`
        if (scene.atmosphere) prompt += `- 氛围：${scene.atmosphere}\n`
        if (scene.description) prompt += `- 描述：${scene.description}\n`
        prompt += '\n'
      }
    }

    prompt += '---\n请根据以上信息，续写小说内容。'

    return prompt
  }

  // AI 生成内容（调用真实后端 API）
  const handleAiGenerate = async () => {
    if (!aiOutline.trim()) {
      alert('请输入剧情大纲！')
      return
    }

    try {
      setGenerating(true)

      // 根据反检测模式选择不同的API端点
      const apiEndpoint = useStealthMode ? '/api/ai/generate-stealth' : '/api/ai/generate'
      
      // 调用后端 API
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          outline: aiOutline,
          characterIds: selectedCharacters,
          itemIds: selectedItems,
          sceneId: selectedScene,
          // 根据续写模式决定是否发送当前内容作为上下文
          previousContent: isContinueWriting ? chapterContent : '',
          targetWords: targetWords // 使用用户选择的目标字数
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '生成失败')
      }

      if (!data.success) {
        throw new Error(data.error || '生成失败')
      }

      // 根据续写模式插入内容
      let newContent
      if (isContinueWriting) {
        // 续写模式：追加到末尾
        newContent = chapterContent + '\n\n' + data.content.trim()
        alert('✅ AI 内容已生成并追加到编辑器末尾！')
      } else {
        // 独立生成模式：替换编辑器内容
        newContent = data.content.trim()
        alert('✅ AI 内容已生成并填入编辑器！')
      }
      
      setChapterContent(newContent)
      setHasUnsavedChanges(true)

      // 清空表单
      setAiOutline('')
      setSelectedCharacters([])
      setSelectedItems([])
      setSelectedScene(null)

    } catch (error) {
      // 显示详细错误信息
      if (error.message.includes('API Key') || error.message.includes('Project ID')) {
        alert('⚠️ AI 配置错误：' + error.message + '\n\n请在 backend/.env 文件中配置 VERTEX_AI_API_KEY 和 VERTEX_AI_PROJECT_ID')
      } else if (error.message.includes('配置')) {
        alert('⚠️ ' + error.message + '\n\n请检查 backend/.env 文件中的 AI 配置')
      } else {
        alert('❌ 生成失败：' + error.message + '\n\n请查看控制台获取详细信息')
      }
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">⏳</div>
        <p className="text-gray-500">加载中...</p>
      </div>
    )
  }

  if (!novel) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">❌</div>
        <p className="text-gray-500">小说不存在</p>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 top-16 flex flex-col bg-gray-50">
      {/* 顶部工具栏 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        {/* 左侧：返回和标题 */}
        <div className="flex items-center space-x-4">
          <button
            onClick={goBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition px-3 py-1 rounded hover:bg-gray-100"
          >
            <span>←</span>
            <span>返回</span>
          </button>
          <div className="h-6 w-px bg-gray-300"></div>
          <div>
            <h1 className="text-lg font-bold text-gray-800">{novel.title}</h1>
            <p className="text-xs text-gray-500">
              {chapters.length} 章 | {currentChapter ? `第 ${currentChapter.chapter_number} 章` : '未选择章节'}
            </p>
          </div>
        </div>

        {/* 右侧：操作按钮 */}
        <div className="flex items-center space-x-3">
          {hasUnsavedChanges && (
            <span className="text-sm text-orange-600">● 未保存</span>
          )}
          <span className="text-sm text-gray-500">
            字数：{chapterContent.length}
          </span>
          <button
            onClick={toggleAiPanel}
            disabled={!currentChapterId}
            className={`px-6 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 ${
              aiPanelVisible 
                ? 'bg-purple-500 hover:bg-purple-600 text-white' 
                : 'bg-purple-50 hover:bg-purple-100 text-purple-600 border border-purple-200'
            }`}
          >
            <span>🤖 AI 写作</span>
          </button>
          <button
            onClick={handleSaveChapter}
            disabled={saving || !currentChapterId}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <span>{saving ? '保存中...' : '💾 保存'}</span>
          </button>
          
          {/* 自动保存状态提示 */}
          {autoSaving && (
            <span className="text-sm text-gray-500 animate-pulse">
              ⏳ 自动保存中...
            </span>
          )}
          {!autoSaving && !hasUnsavedChanges && currentChapterId && (
            <span className="text-sm text-green-600">
              ✓ 已保存
            </span>
          )}
          {hasUnsavedChanges && !autoSaving && (
            <span className="text-sm text-orange-500">
              ● 未保存
            </span>
          )}
        </div>
      </div>

      {/* 主内容区：侧边栏 + 编辑器 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧章节列表侧边栏 */}
        {sidebarVisible && (
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            {/* 侧边栏标题和操作 */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-gray-800">章节列表</h2>
                <button
                  onClick={toggleSidebar}
                  className="text-gray-500 hover:text-gray-700 transition"
                  title="收起侧边栏"
                >
                  ◀
                </button>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition flex items-center justify-center space-x-2"
              >
                <span>+</span>
                <span>新建章节</span>
              </button>
            </div>

            {/* 章节列表 */}
            <div className="flex-1 overflow-y-auto">
              {chapters.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="text-4xl mb-3">📄</div>
                  <p className="text-gray-500 text-sm mb-3">还没有章节</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="text-green-600 hover:text-green-700 text-sm font-medium"
                  >
                    创建第一章 →
                  </button>
                </div>
              ) : (
                <div className="p-2">
                  {chapters.map((chapter, index) => (
                    <div
                      key={chapter.id}
                      onClick={() => selectChapter(chapter.id)}
                      className={`
                        p-3 mb-1 rounded-lg cursor-pointer transition group
                        ${chapter.id === currentChapterId 
                          ? 'bg-blue-50 border-l-4 border-blue-500' 
                          : 'hover:bg-gray-50'
                        }
                      `}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className={`text-xs font-medium ${
                              chapter.id === currentChapterId ? 'text-blue-600' : 'text-gray-500'
                            }`}>
                              第 {chapter.chapter_number || index + 1} 章
                            </span>
                            {chapter.id === currentChapterId && hasUnsavedChanges && (
                              <span className="text-orange-500">●</span>
                            )}
                          </div>
                          <h3 className={`text-sm font-medium truncate ${
                            chapter.id === currentChapterId ? 'text-gray-900' : 'text-gray-700'
                          }`}>
                            {chapter.title}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            {chapter.word_count || 0} 字
                          </p>
                        </div>
                        
                        {/* 删除按钮 */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteChapter(chapter.id, chapter.title)
                          }}
                          className="opacity-0 group-hover:opacity-100 ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition"
                          title="删除章节"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 侧边栏底部信息 */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="text-xs text-gray-500 space-y-1">
                <div>📚 共 {chapters.length} 章</div>
                <div>📊 总字数：{chapters.reduce((sum, ch) => sum + (ch.word_count || 0), 0)}</div>
              </div>
            </div>
          </div>
        )}

        {/* 展开侧边栏按钮（当侧边栏隐藏时显示） */}
        {!sidebarVisible && (
          <button
            onClick={toggleSidebar}
            className="w-12 bg-white border-r border-gray-200 flex items-center justify-center hover:bg-gray-50 transition"
            title="展开侧边栏"
          >
            <span className="text-gray-500">▶</span>
          </button>
        )}

        {/* 中间编辑器区域 */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          {currentChapter ? (
            <>
              {/* 编辑区 */}
              <div className="flex-1 overflow-y-auto p-8">
                {/* 章节标题 */}
                <input
                  type="text"
                  value={chapterTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="请输入章节标题"
                  className="w-full text-3xl font-bold border-none outline-none mb-6 text-gray-800 placeholder-gray-400"
                />

                {/* 章节内容 */}
                <textarea
                  value={chapterContent}
                  onChange={(e) => handleContentChange(e.target.value)}
                  onMouseUp={handleTextSelection}
                  onClick={handleEditorClick}
                  placeholder="开始写作..."
                  className="w-full h-full min-h-[600px] text-lg border-none outline-none resize-none text-gray-800 placeholder-gray-400 leading-relaxed"
                  style={{ lineHeight: '2' }}
                />
              </div>
            </>
          ) : (
            /* 未选择章节时的占位 */
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div>
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-2xl font-medium text-gray-700 mb-2">选择或创建一个章节开始写作</h3>
                <p className="text-gray-500 mb-6">
                  从左侧选择已有章节，或点击「新建章节」创建新章
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition"
                >
                  + 创建第一章
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 右侧 AI 写作面板 */}
        {aiPanelVisible && (
          <div className="w-96 bg-white border-l border-gray-200 flex flex-col overflow-hidden">
            {/* AI 面板标题 */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
                  <span>🤖</span>
                  <span>AI 写作助手</span>
                </h2>
                <button
                  onClick={toggleAiPanel}
                  className="text-gray-500 hover:text-gray-700 transition"
                  title="关闭面板"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-gray-600">
                选择卡片和输入大纲，AI 帮你续写故事
              </p>
            </div>

            {/* AI 面板内容 */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* 剧情大纲 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  剧情大纲 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={aiOutline}
                  onChange={(e) => setAiOutline(e.target.value)}
                  placeholder="描述接下来的剧情发展，例如：主角在森林中遇到了神秘老人..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
                  rows="4"
                />
                <p className="text-xs text-gray-500 mt-1">
                  必填项，请描述你想要生成的剧情方向
                </p>
              </div>

              {/* 生成字数选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  生成字数
                </label>
                <select
                  value={targetWords}
                  onChange={(e) => setTargetWords(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm bg-white"
                >
                  <option value={500}>简短（约 500 字）</option>
                  <option value={1000}>标准（约 1000 字）</option>
                  <option value={1500}>中等（约 1500 字）</option>
                  <option value={2000}>较长（约 2000 字）</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  AI 将生成约 {targetWords} 字的内容
                </p>
              </div>

              {/* 生成模式选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  生成模式
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsContinueWriting(true)}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition ${
                      isContinueWriting
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    📝 续写模式
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsContinueWriting(false)}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition ${
                      !isContinueWriting
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    ✨ 独立生成
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {isContinueWriting 
                    ? '续写：基于当前内容继续创作，内容追加到末尾' 
                    : '独立生成：不考虑当前内容，生成全新内容并替换编辑器'}
                </p>
              </div>

              {/* 反检测模式选项 */}
              <div className="border-2 border-dashed border-orange-300 rounded-lg p-4 bg-orange-50">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useStealthMode}
                    onChange={(e) => setUseStealthMode(e.target.checked)}
                    className="mt-0.5 w-5 h-5 rounded text-orange-600 focus:ring-orange-500 cursor-pointer"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-800">🛡️ 启用反检测模式</span>
                      <span className="px-2 py-0.5 bg-orange-200 text-orange-800 text-xs rounded font-medium">实验性</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      采用多轮生成策略（2次API调用）：
                    </p>
                    <ul className="text-xs text-gray-600 mt-1 ml-4 space-y-0.5">
                      <li>• 第一轮：场景驱动生成初稿</li>
                      <li>• 第二轮：风格改写（AI腔→网文腔）</li>
                      <li>• Token消耗约为普通模式的 2 倍</li>
                      <li>• 后端终端可查看详细生成日志</li>
                    </ul>
                  </div>
                </label>
              </div>

              {/* 人物卡选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择人物 <span className="text-gray-400 text-xs">(可多选)</span>
                </label>
                <button
                  onClick={() => setShowCharacterModal(true)}
                  className="w-full px-4 py-3 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition text-left"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      {selectedCharacters.length > 0 ? (
                        <span className="font-medium text-purple-600">已选择 {selectedCharacters.length} 个人物</span>
                      ) : (
                        <span className="text-gray-500">点击选择人物卡</span>
                      )}
                    </span>
                    <span className="text-purple-600">→</span>
                  </div>
                  {selectedCharacters.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {selectedCharacters.map(charId => {
                        const char = characters.find(c => c.id === charId)
                        return char ? (
                          <span key={charId} className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">
                            {char.name}
                          </span>
                        ) : null
                      })}
                    </div>
                  )}
                </button>
              </div>

              {/* 物品卡选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择物品 <span className="text-gray-400 text-xs">(可多选)</span>
                </label>
                <button
                  onClick={() => setShowItemModal(true)}
                  className="w-full px-4 py-3 border-2 border-dashed border-green-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition text-left"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      {selectedItems.length > 0 ? (
                        <span className="font-medium text-green-600">已选择 {selectedItems.length} 个物品</span>
                      ) : (
                        <span className="text-gray-500">点击选择物品卡</span>
                      )}
                    </span>
                    <span className="text-green-600">→</span>
                  </div>
                  {selectedItems.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {selectedItems.map(itemId => {
                        const item = items.find(i => i.id === itemId)
                        return item ? (
                          <span key={itemId} className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                            {item.name}
                          </span>
                        ) : null
                      })}
                    </div>
                  )}
                </button>
              </div>

              {/* 场景卡选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  选择场景 <span className="text-gray-400 text-xs">(单选)</span>
                </label>
                <button
                  onClick={() => setShowSceneModal(true)}
                  className="w-full px-4 py-3 border-2 border-dashed border-indigo-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition text-left"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      {selectedScene ? (
                        <span className="font-medium text-indigo-600">
                          {scenes.find(s => s.id === selectedScene)?.name || '已选择场景'}
                        </span>
                      ) : (
                        <span className="text-gray-500">点击选择场景卡</span>
                      )}
                    </span>
                    <span className="text-indigo-600">→</span>
                  </div>
                </button>
              </div>

              {/* 提示 */}
              <div className={`border rounded-lg p-3 ${
                useStealthMode 
                  ? 'bg-orange-50 border-orange-200' 
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <p className={`text-xs mb-2 ${
                  useStealthMode ? 'text-orange-800' : 'text-blue-800'
                }`}>
                  {useStealthMode ? '🛡️ ' : '💡 '}
                  <strong>
                    {useStealthMode ? '反检测模式已启用' : '提示'}：
                  </strong>
                  {' '}
                  {useStealthMode 
                    ? '将进行2轮AI生成，查看后端终端可看到详细过程' 
                    : 'AI 会根据你选择的卡片和大纲生成符合设定的内容'}
                </p>
                {!useStealthMode && (
                  <p className="text-xs text-blue-700">
                    • <strong>续写模式：</strong>基于当前正文内容续写，适合连贯创作<br/>
                    • <strong>独立生成：</strong>不考虑当前正文，独立生成全新内容<br/>
                    • 无论哪种模式，选择的卡片信息都会发送给AI作为参考
                  </p>
                )}
              </div>
            </div>

            {/* AI 面板底部按钮 */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={handleAiGenerate}
                disabled={generating || !aiOutline.trim()}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-6 py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {generating ? (
                  <>⏳ 生成中...</>
                ) : (
                  <>{isContinueWriting ? '📝 续写内容' : '✨ 生成内容'}</>
                )}
              </button>
              <p className="text-xs text-gray-500 text-center mt-2">
                {generating 
                  ? '正在生成，请稍候...' 
                  : isContinueWriting 
                    ? '点击生成后，AI 内容会追加到编辑器末尾' 
                    : '点击生成后，AI 内容会替换编辑器中的内容'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 新建章节对话框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">新建章节</h2>

            {/* 输入框 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                章节标题 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newChapterTitle}
                onChange={(e) => setNewChapterTitle(e.target.value)}
                placeholder="例如：第一章 初遇"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
                章节将自动编号为第 {chapters.length + 1} 章
              </p>
            </div>

            {/* 按钮 */}
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setNewChapterTitle('')
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                取消
              </button>
              <button
                onClick={handleCreateChapter}
                className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
              >
                创建并编辑
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 人物卡选择弹窗 */}
      {showCharacterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">选择人物卡</h2>
              <button
                onClick={() => setShowCharacterModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ✕
              </button>
            </div>

            {cardsLoading ? (
              <p className="text-center text-gray-500 py-8">加载中...</p>
            ) : characters.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">还没有人物卡</p>
                <button
                  onClick={() => {
                    setShowCharacterModal(false)
                    navigate('/cards')
                  }}
                  className="text-purple-600 hover:text-purple-700 font-medium"
                >
                  去创建 →
                </button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2">
                {characters.map(char => {
                  const isExpanded = expandedCharacters.includes(char.id)
                  return (
                    <div
                      key={char.id}
                      className={`block p-4 rounded-lg transition border-2 ${
                        selectedCharacters.includes(char.id)
                          ? 'bg-purple-50 border-purple-400'
                          : 'bg-white border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedCharacters.includes(char.id)}
                          onChange={() => toggleCharacter(char.id)}
                          className="mt-1 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-bold text-gray-800">{char.name}</h3>
                              {char.age && <span className="text-xs text-gray-500">{char.age}岁</span>}
                              {char.gender && <span className="text-xs text-gray-500">· {char.gender}</span>}
                            </div>
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                toggleCharacterExpand(char.id)
                              }}
                              className="text-purple-600 hover:text-purple-700 text-sm font-medium px-2 py-1 hover:bg-purple-100 rounded transition"
                              title={isExpanded ? '收起详情' : '展开详情'}
                            >
                              {isExpanded ? '收起 ▲' : '详情 ▼'}
                            </button>
                          </div>
                          {isExpanded && (
                            <div className="space-y-1 mt-2 pt-2 border-t border-purple-200">
                              {char.personality && (
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">性格：</span>{char.personality}
                                </p>
                              )}
                              {char.appearance && (
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">外貌：</span>{char.appearance}
                                </p>
                              )}
                              {char.background && (
                                <p className="text-sm text-gray-500">
                                  <span className="font-medium">背景：</span>{char.background}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="mt-4 pt-4 border-t flex justify-between items-center">
              <span className="text-sm text-gray-600">
                已选择 {selectedCharacters.length} 个人物
              </span>
              <button
                onClick={() => setShowCharacterModal(false)}
                className="px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 物品卡选择弹窗 */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">选择物品卡</h2>
              <button
                onClick={() => setShowItemModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ✕
              </button>
            </div>

            {cardsLoading ? (
              <p className="text-center text-gray-500 py-8">加载中...</p>
            ) : items.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">还没有物品卡</p>
                <button
                  onClick={() => {
                    setShowItemModal(false)
                    navigate('/cards')
                  }}
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  去创建 →
                </button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2">
                {items.map(item => {
                  const isExpanded = expandedItems.includes(item.id)
                  return (
                    <div
                      key={item.id}
                      className={`block p-4 rounded-lg transition border-2 ${
                        selectedItems.includes(item.id)
                          ? 'bg-green-50 border-green-400'
                          : 'bg-white border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => toggleItem(item.id)}
                          className="mt-1 rounded text-green-600 focus:ring-green-500 cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-bold text-gray-800">{item.name}</h3>
                              {item.rarity && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded font-medium">
                                  {item.rarity}
                                </span>
                              )}
                            </div>
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                toggleItemExpand(item.id)
                              }}
                              className="text-green-600 hover:text-green-700 text-sm font-medium px-2 py-1 hover:bg-green-100 rounded transition"
                              title={isExpanded ? '收起详情' : '展开详情'}
                            >
                              {isExpanded ? '收起 ▲' : '详情 ▼'}
                            </button>
                          </div>
                          {isExpanded && (
                            <div className="space-y-1 mt-2 pt-2 border-t border-green-200">
                              {item.description && (
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">描述：</span>{item.description}
                                </p>
                              )}
                              {item.function && (
                                <p className="text-sm text-gray-500">
                                  <span className="font-medium">作用：</span>{item.function}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="mt-4 pt-4 border-t flex justify-between items-center">
              <span className="text-sm text-gray-600">
                已选择 {selectedItems.length} 个物品
              </span>
              <button
                onClick={() => setShowItemModal(false)}
                className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 场景卡选择弹窗 */}
      {showSceneModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">选择场景卡</h2>
              <button
                onClick={() => setShowSceneModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ✕
              </button>
            </div>

            {cardsLoading ? (
              <p className="text-center text-gray-500 py-8">加载中...</p>
            ) : scenes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">还没有场景卡</p>
                <button
                  onClick={() => {
                    setShowSceneModal(false)
                    navigate('/cards')
                  }}
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  去创建 →
                </button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2">
                {scenes.map(scene => {
                  const isExpanded = expandedScenes.includes(scene.id)
                  return (
                    <div
                      key={scene.id}
                      className={`block p-4 rounded-lg transition border-2 ${
                        selectedScene === scene.id
                          ? 'bg-indigo-50 border-indigo-400'
                          : 'bg-white border-gray-200 hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <input
                          type="radio"
                          name="scene"
                          checked={selectedScene === scene.id}
                          onChange={() => selectSceneCard(scene.id)}
                          className="mt-1 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-bold text-gray-800">{scene.name}</h3>
                              {scene.time_period && (
                                <span className="text-xs text-gray-500">· {scene.time_period}</span>
                              )}
                            </div>
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                toggleSceneExpand(scene.id)
                              }}
                              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium px-2 py-1 hover:bg-indigo-100 rounded transition"
                              title={isExpanded ? '收起详情' : '展开详情'}
                            >
                              {isExpanded ? '收起 ▲' : '详情 ▼'}
                            </button>
                          </div>
                          {isExpanded && (
                            <div className="space-y-1 mt-2 pt-2 border-t border-indigo-200">
                              {scene.atmosphere && (
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">氛围：</span>{scene.atmosphere}
                                </p>
                              )}
                              {scene.description && (
                                <p className="text-sm text-gray-500">
                                  <span className="font-medium">描述：</span>{scene.description}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="mt-4 pt-4 border-t flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {selectedScene ? '已选择 1 个场景' : '未选择场景'}
              </span>
              <button
                onClick={() => setShowSceneModal(false)}
                className="px-6 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 文本选择浮动菜单 */}
      {selectionMenu.show && (
        <div
          className="selection-menu fixed z-50 bg-white rounded-lg shadow-2xl border border-gray-200 flex space-x-2 p-2"
          style={{
            left: `${selectionMenu.x}px`,
            top: `${selectionMenu.y}px`,
            transform: 'translateX(-50%)'
          }}
        >
          <button
            onClick={openDiscussModal}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition text-sm font-medium flex items-center space-x-1"
          >
            <span>💬</span>
            <span>讨论</span>
          </button>
          <button
            onClick={openRewriteModal}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition text-sm font-medium flex items-center space-x-1"
          >
            <span>✏️</span>
            <span>修改</span>
          </button>
        </div>
      )}

      {/* 讨论弹窗 */}
      {showDiscussModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-3xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">💬 AI 讨论文本</h2>
              <button
                onClick={() => setShowDiscussModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ✕
              </button>
            </div>

            {/* 选中的文本 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">选中的文本</label>
              <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 max-h-32 overflow-y-auto">
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{selectedText}</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                共 {selectedText.length} 字
              </p>
            </div>

            {/* 讨论结果 */}
            {discussionResult && (
              <div className="mb-4 flex-1 overflow-y-auto">
                <label className="block text-sm font-medium text-gray-700 mb-2">AI 分析</label>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{discussionResult}</p>
                </div>
              </div>
            )}

            {/* 按钮 */}
            <div className="flex space-x-3 pt-4 border-t">
              <button
                onClick={() => setShowDiscussModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                关闭
              </button>
              <button
                onClick={handleDiscuss}
                disabled={discussing}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition disabled:opacity-50"
              >
                {discussing ? '⏳ 讨论中...' : '🤖 开始讨论'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 修改弹窗 */}
      {showRewriteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-3xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">✏️ AI 智能修改</h2>
              <button
                onClick={() => setShowRewriteModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ✕
              </button>
            </div>

            {/* 选中的文本 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">原文</label>
              <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 max-h-32 overflow-y-auto">
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{selectedText}</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                原文字数：{selectedText.length} 字
              </p>
            </div>

            {/* 修改模式选择 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">修改模式</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRewriteMode('expand')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    rewriteMode === 'expand'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📈 扩写
                </button>
                <button
                  type="button"
                  onClick={() => setRewriteMode('shrink')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    rewriteMode === 'shrink'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📉 缩写
                </button>
                <button
                  type="button"
                  onClick={() => setRewriteMode('rewrite')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    rewriteMode === 'rewrite'
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ✍️ 改写
                </button>
              </div>
            </div>

            {/* 目标字数滑块 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                目标字数：{rewriteTargetWords} 字
              </label>
              <input
                type="range"
                min={getWordRange().min}
                max={getWordRange().max}
                value={rewriteTargetWords}
                onChange={(e) => setRewriteTargetWords(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>最少 {getWordRange().min} 字</span>
                <span>最多 {getWordRange().max} 字</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {rewriteMode === 'expand' && '📈 扩写：可增加到原文的5倍'}
                {rewriteMode === 'shrink' && '📉 缩写：最少保留原文的10%'}
                {rewriteMode === 'rewrite' && '✍️ 改写：字数上下浮动不超过10%'}
              </p>
            </div>

            {/* 修改指令 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                修改思路 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rewriteInstruction}
                onChange={(e) => setRewriteInstruction(e.target.value)}
                placeholder="描述你希望如何修改这段文字，例如：增加更多细节描写、简化语言、改成第一人称..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm"
                rows="3"
              />
            </div>

            {/* 按钮 */}
            <div className="flex space-x-3">
              <button
                onClick={() => setShowRewriteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                取消
              </button>
              <button
                onClick={handleRewrite}
                disabled={rewriting || !rewriteInstruction.trim()}
                className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition disabled:opacity-50"
              >
                {rewriting ? '⏳ 修改中...' : '✨ 开始修改'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NovelDetailPage

