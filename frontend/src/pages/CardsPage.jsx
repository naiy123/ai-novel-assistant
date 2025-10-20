import { useState, useEffect } from 'react'

/**
 * 卡片库页面
 * 功能：管理人物卡、物品卡、背景卡（作者级别共享）
 */
function CardsPage() {
  // 状态管理
  const [activeTab, setActiveTab] = useState('character') // character, item, scene
  const [loading, setLoading] = useState(false)
  
  // 卡片数据
  const [characters, setCharacters] = useState([])
  const [items, setItems] = useState([])
  const [scenes, setScenes] = useState([])
  
  // 模态框状态
  const [showModal, setShowModal] = useState(false)
  const [editingCard, setEditingCard] = useState(null) // null 表示新建，否则为编辑
  
  // 表单数据
  const [formData, setFormData] = useState({})

  // 页面加载时获取所有卡片（使用小说ID=1作为默认，实际应该是作者ID）
  useEffect(() => {
    fetchAllCards()
  }, [])

  // 获取所有卡片
  const fetchAllCards = async () => {
    setLoading(true)
    try {
      // 使用小说ID=1作为示例（实际应该是作者级别）
      const novelId = 1
      
      const [charRes, itemRes, sceneRes] = await Promise.all([
        fetch(`/api/cards/characters/${novelId}`),
        fetch(`/api/cards/items/${novelId}`),
        fetch(`/api/cards/scenes/${novelId}`)
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
      setLoading(false)
    }
  }

  // 打开新建模态框
  const handleCreate = () => {
    setEditingCard(null)
    setFormData({})
    setShowModal(true)
  }

  // 打开编辑模态框
  const handleEdit = (card) => {
    setEditingCard(card)
    setFormData(card)
    setShowModal(true)
  }

  // 删除卡片
  const handleDelete = async (type, id, name) => {
    if (!confirm(`确定要删除「${name}」吗？`)) {
      return
    }

    try {
      const endpoints = {
        character: `/api/cards/characters/${id}`,
        item: `/api/cards/items/${id}`,
        scene: `/api/cards/scenes/${id}`
      }

      const response = await fetch(endpoints[type], { method: 'DELETE' })

      if (response.ok) {
        alert('🗑️ 删除成功！')
        fetchAllCards()
      } else {
        alert('删除失败')
      }
    } catch (error) {
      console.error('删除失败:', error)
      alert('删除失败，请重试')
    }
  }

  // 保存卡片
  const handleSave = async () => {
    try {
      const novelId = 1 // 使用小说ID=1（实际应该是作者ID）
      
      const endpoints = {
        character: '/api/cards/characters',
        item: '/api/cards/items',
        scene: '/api/cards/scenes'
      }

      const data = { novelId, ...formData }

      const response = await fetch(endpoints[activeTab], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        alert('✅ 保存成功！')
        setShowModal(false)
        fetchAllCards()
      } else {
        alert('保存失败')
      }
    } catch (error) {
      console.error('保存失败:', error)
      alert('保存失败，请重试')
    }
  }

  // 渲染人物卡列表
  const renderCharacters = () => {
    if (characters.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👤</div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">还没有人物卡</h3>
          <p className="text-gray-500 mb-4">创建人物卡来管理小说角色</p>
          <button
            onClick={handleCreate}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition"
          >
            + 创建第一个人物卡
          </button>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {characters.map(char => (
          <div key={char.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{char.name}</h3>
                <p className="text-sm text-gray-500">
                  {char.age ? `${char.age}岁` : ''} {char.gender || ''}
                </p>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => handleEdit(char)}
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                  title="编辑"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete('character', char.id, char.name)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                  title="删除"
                >
                  🗑️
                </button>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              {char.personality && (
                <div>
                  <span className="font-medium text-gray-700">性格：</span>
                  <span className="text-gray-600">{char.personality}</span>
                </div>
              )}
              {char.appearance && (
                <div>
                  <span className="font-medium text-gray-700">外貌：</span>
                  <span className="text-gray-600">{char.appearance}</span>
                </div>
              )}
              {char.background && (
                <div>
                  <span className="font-medium text-gray-700">背景：</span>
                  <span className="text-gray-600 line-clamp-2">{char.background}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  // 渲染物品卡列表
  const renderItems = () => {
    if (items.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚔️</div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">还没有物品卡</h3>
          <p className="text-gray-500 mb-4">创建物品卡来管理关键道具</p>
          <button
            onClick={handleCreate}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition"
          >
            + 创建第一个物品卡
          </button>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => (
          <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{item.name}</h3>
                {item.rarity && (
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                    {item.rarity}
                  </span>
                )}
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => handleEdit(item)}
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                  title="编辑"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete('item', item.id, item.name)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                  title="删除"
                >
                  🗑️
                </button>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              {item.description && (
                <div>
                  <span className="font-medium text-gray-700">描述：</span>
                  <span className="text-gray-600">{item.description}</span>
                </div>
              )}
              {item.function && (
                <div>
                  <span className="font-medium text-gray-700">作用：</span>
                  <span className="text-gray-600">{item.function}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  // 渲染背景卡列表
  const renderScenes = () => {
    if (scenes.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏰</div>
          <h3 className="text-xl font-medium text-gray-700 mb-2">还没有背景卡</h3>
          <p className="text-gray-500 mb-4">创建背景卡来管理场景设定</p>
          <button
            onClick={handleCreate}
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-lg transition"
          >
            + 创建第一个背景卡
          </button>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenes.map(scene => (
          <div key={scene.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-800">{scene.name}</h3>
              <div className="flex space-x-1">
                <button
                  onClick={() => handleEdit(scene)}
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                  title="编辑"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete('scene', scene.id, scene.name)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                  title="删除"
                >
                  🗑️
                </button>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              {scene.description && (
                <div>
                  <span className="font-medium text-gray-700">描述：</span>
                  <span className="text-gray-600 line-clamp-3">{scene.description}</span>
                </div>
              )}
              {scene.atmosphere && (
                <div>
                  <span className="font-medium text-gray-700">氛围：</span>
                  <span className="text-gray-600">{scene.atmosphere}</span>
                </div>
              )}
              {scene.time_period && (
                <div>
                  <span className="font-medium text-gray-700">时期：</span>
                  <span className="text-gray-600">{scene.time_period}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }

  // 渲染创建/编辑模态框
  const renderModal = () => {
    if (!showModal) return null

    const isCharacter = activeTab === 'character'
    const isItem = activeTab === 'item'
    const isScene = activeTab === 'scene'

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {editingCard ? '编辑' : '新建'}
            {isCharacter && '人物卡'}
            {isItem && '物品卡'}
            {isScene && '背景卡'}
          </h2>

          <div className="space-y-4">
            {/* 人物卡表单 */}
            {isCharacter && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    姓名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="角色姓名"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">年龄</label>
                    <input
                      type="number"
                      value={formData.age || ''}
                      onChange={(e) => setFormData({...formData, age: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="年龄"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">性别</label>
                    <select
                      value={formData.gender || ''}
                      onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">请选择</option>
                      <option value="男">男</option>
                      <option value="女">女</option>
                      <option value="其他">其他</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">性格</label>
                  <textarea
                    value={formData.personality || ''}
                    onChange={(e) => setFormData({...formData, personality: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    rows="2"
                    placeholder="描述角色性格特点"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">外貌</label>
                  <textarea
                    value={formData.appearance || ''}
                    onChange={(e) => setFormData({...formData, appearance: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    rows="2"
                    placeholder="描述角色外貌特征"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">背景故事</label>
                  <textarea
                    value={formData.background || ''}
                    onChange={(e) => setFormData({...formData, background: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    rows="3"
                    placeholder="角色的背景故事和经历"
                  />
                </div>
              </>
            )}

            {/* 物品卡表单 */}
            {isItem && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="物品名称"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">稀有度</label>
                  <select
                    value={formData.rarity || ''}
                    onChange={(e) => setFormData({...formData, rarity: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  >
                    <option value="">请选择</option>
                    <option value="普通">普通</option>
                    <option value="稀有">稀有</option>
                    <option value="史诗">史诗</option>
                    <option value="传说">传说</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">描述</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    rows="3"
                    placeholder="物品的外观、来历等描述"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">作用</label>
                  <textarea
                    value={formData.function || ''}
                    onChange={(e) => setFormData({...formData, function: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    rows="2"
                    placeholder="物品的功能和作用"
                  />
                </div>
              </>
            )}

            {/* 背景卡表单 */}
            {isScene && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    场景名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="场景或地点名称"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">时期</label>
                  <input
                    type="text"
                    value={formData.timePeriod || ''}
                    onChange={(e) => setFormData({...formData, timePeriod: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="例如：古代、现代、未来等"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">氛围</label>
                  <input
                    type="text"
                    value={formData.atmosphere || ''}
                    onChange={(e) => setFormData({...formData, atmosphere: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="例如：神秘、欢快、压抑等"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">详细描述</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    rows="4"
                    placeholder="详细描述场景的环境、特点等"
                  />
                </div>
              </>
            )}
          </div>

          {/* 按钮 */}
          <div className="flex space-x-3 mt-6">
            <button
              onClick={() => {
                setShowModal(false)
                setFormData({})
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={!formData.name}
              className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">卡片库</h1>
        <p className="text-gray-500">管理你的人物、物品和背景卡片（所有小说共享）</p>
      </div>

      {/* 卡片类型选项卡 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('character')}
            className={`px-6 py-2 rounded-lg transition ${
              activeTab === 'character'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            👤 人物卡 ({characters.length})
          </button>
          <button
            onClick={() => setActiveTab('item')}
            className={`px-6 py-2 rounded-lg transition ${
              activeTab === 'item'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ⚔️ 物品卡 ({items.length})
          </button>
          <button
            onClick={() => setActiveTab('scene')}
            className={`px-6 py-2 rounded-lg transition ${
              activeTab === 'scene'
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🏰 背景卡 ({scenes.length})
          </button>
        </div>

        {/* 新建按钮 */}
        <button
          onClick={handleCreate}
          className={`px-6 py-2 rounded-lg text-white transition shadow-md hover:shadow-lg ${
            activeTab === 'character' ? 'bg-blue-500 hover:bg-blue-600' :
            activeTab === 'item' ? 'bg-green-500 hover:bg-green-600' :
            'bg-purple-500 hover:bg-purple-600'
          }`}
        >
          + 新建卡片
        </button>
      </div>

      {/* 卡片列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-gray-500">加载中...</p>
          </div>
        ) : (
          <>
            {activeTab === 'character' && renderCharacters()}
            {activeTab === 'item' && renderItems()}
            {activeTab === 'scene' && renderScenes()}
          </>
        )}
      </div>

      {/* 卡片说明 */}
      <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-100">
        <h4 className="font-medium text-blue-800 mb-2">💡 提示</h4>
        <p className="text-sm text-blue-700">
          卡片库中的所有卡片在你的所有小说中共享使用。创建 AI 写作时可以选择卡片作为参考素材。
        </p>
      </div>

      {/* 模态框 */}
      {renderModal()}
    </div>
  )
}

export default CardsPage

